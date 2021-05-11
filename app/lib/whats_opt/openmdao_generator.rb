# frozen_string_literal: true

require "whats_opt/code_generator"
require "whats_opt/server_generator"

module WhatsOpt
  class OpenmdaoGenerator < CodeGenerator
    DEFAULT_DOE_DRIVER = :smt_doe_lhs
    DEFAULT_OPTIMIZATION_DRIVER = :scipy_optimizer_slsqp

    class DisciplineNotFoundException < StandardError
    end

    def initialize(mda, server_host: nil, driver_name: nil, driver_options: {},
                   whatsopt_url: "", api_key: "", remote_ip: "")
      super(mda)
      @prefix = "openmdao"
      @server_host = server_host
      @remote = !server_host.nil?
      @sgen = WhatsOpt::ServerGenerator.new(mda, server_host, remote_ip)
      @sqlite_filename = "cases.sqlite"
      @driver_name = driver_name.to_sym if driver_name
      @driver_options = driver_options
      @root_modulepath = nil
      @impl = @mda.openmdao_impl || OpenmdaoAnalysisImpl.new
      @whatsopt_url = whatsopt_url
      @api_key = api_key
      @remote_ip = remote_ip
      @check_only = false
    end

    def check_mda_setup
      ok, lines = false, []
      @mda.set_as_root_module
      Dir.mktmpdir("check_#{@mda.basename}_") do |dir|
        # dir="/tmp" # for debug
        begin
          @check_only = true
          _generate_code(dir, with_server: false, with_runops: false)
        rescue ServerGenerator::ThriftError => e
          ok = false
          lines = e.to_s.lines.map(&:chomp)
        else
          ok, log = _check_mda dir
          lines = log.lines.map(&:chomp)
        end
      end
      @mda.unset_root_module
      return ok, lines
    end

    def run(method = "analysis", sqlite_filename = nil)
      ok, lines = false, []
      Dir.mktmpdir("run_#{@mda.basename}_#{method}") do |dir|
        dir='/tmp' # for debug
        begin
          _generate_code(dir, sqlite_filename: sqlite_filename)
        rescue ServerGenerator::ThriftError => e
          ok = false
          lines = e.to_s.lines.map(&:chomp)
        else
          ok, log = _run_mda(dir, method)
          lines = log.lines.map(&:chomp)
        end
      end
      return ok, lines
    end

    def monitor(method = "analysis", sqlite_filename = nil, &block)
      Dir.mktmpdir("run_#{@mda.basename}_#{method}") do |dir|
        # dir="/tmp" # for debug
        _generate_code dir, sqlite_filename: sqlite_filename
        _monitor_mda(dir, method, &block)
      end
    end

    def _check_mda(dir)
      script = File.join(dir, @mda.py_filename)
      Rails.logger.info "#{PYTHON} #{script} --no-n2"
      stdouterr, status = Open3.capture2e(PYTHON, script, "--no-n2")
      return status.success?, stdouterr
    end

    def _run_mda(dir, method)
      script = File.join(dir, "run_#{method}.py")
      Rails.logger.info "#{PYTHON} #{script}"
      stdouterr, status = Open3.capture2e(PYTHON, script, "--batch")
      return status.success?, stdouterr
    end

    def _monitor_mda(dir, method, &block)
      script = File.join(dir, "run_#{method}.py")
      Rails.logger.info "#{PYTHON} #{script}"
      Open3.popen2e(PYTHON, script, "--batch", &block)
    end

    # sqlite_filename: nil, with_run: true, with_server: true, with_runops: true
    def _generate_code(gendir, options = {})
      opts = { with_server: true, with_run: true, with_unittests: false }.merge(options)
      @mda.disciplines.nodes.each do |disc|
        if disc.has_sub_analysis?
          _generate_sub_analysis(disc, gendir, opts)
        else
          _generate_discipline(disc, gendir, opts)
          _generate_test_scripts(disc, gendir) if opts[:with_unittests]
        end
      end
      _generate_main(gendir, opts)
      _generate_run_scripts(gendir, opts)
      if opts[:with_server] || (!@check_only && @mda.has_remote_discipline?(@remote_ip))
        @sgen._generate_code(gendir, @server_host)
        @genfiles += @sgen.genfiles
      end
      @genfiles
    end

    def _generate_discipline(discipline, gendir, options = {})
      @discipline = discipline  # @discipline used in template
      @dimpl = @discipline.openmdao_impl || OpenmdaoDisciplineImpl.new
      @with_server = options[:with_server]
      if @discipline.type == "metamodel"
        _generate(discipline.py_filename, "openmdao_metamodel.py.erb", gendir)
      else
        _generate(discipline.py_filename, "openmdao_discipline.py.erb", gendir)
      end
      _generate(discipline.py_basefilename, "openmdao_discipline_base.py.erb", gendir)
    end

    # options: sqlite_filename=nil
    def _generate_sub_analysis(super_discipline, gendir, options = {})
      mda = super_discipline.sub_analysis
      sub_ogen = OpenmdaoGenerator.new(mda, server_host: @server_host, driver_name: @driver_name, driver_options: @driver_options)
      gendir = File.join(gendir, mda.basename)
      Dir.mkdir(gendir) unless Dir.exist?(gendir)

      # generate only analaysis code: no script , no server
      opts = options.merge(with_run: false, with_server: false, with_runops: false)
      sub_ogen._generate_code(gendir, opts)
      @genfiles += sub_ogen.genfiles
    end

    def _generate_main(gendir, options = {})
      _generate(@mda.py_filename, "openmdao_main.py.erb", gendir)
      _generate(@mda.py_basefilename, "openmdao_main_base.py.erb", gendir)
      _generate("__init__.py", "__init__.py.erb", gendir)
    end

    # options: sqlite_filename: nil, with_runops: true, with_run: true
    def _generate_run_scripts(gendir, options = {})
      if options[:with_run]
        _generate("run_parameters_init.py", "run_parameters_init.py.erb", gendir)
        _generate("run_analysis.py", "run_analysis.py.erb", gendir)
      end
      if @driver_name # coming from GUI running remote driver
        @driver = OpenmdaoDriverFactory.new(@driver_name, @driver_options).create_driver
        if @driver.optimization?
          if @mda.has_objective?
            @sqlite_filename = options[:sqlite_filename] || "#{@mda.basename}_optimization.sqlite"
            _generate("run_optimization.py", "run_optimization.py.erb", gendir)
          else
            # TODO: generate run_optimization.py with error message
          end
        end
        if @driver.doe?
          @sqlite_filename = options[:sqlite_filename] || "#{@mda.basename}_doe.sqlite"
          _generate("run_doe.py", "run_doe.py.erb", gendir)
        else
          # TODO: generate run_doe.py with error message
        end
      elsif (options[:with_runops] || @mda.is_root_analysis?) && @mda.has_decision_variables?
        @driver = OpenmdaoDriverFactory.new(DEFAULT_DOE_DRIVER).create_driver
        @sqlite_filename = options[:sqlite_filename] || "#{@mda.basename}_doe.sqlite"
        if @mda.uq_mode?
          _generate("run_doe.py", "run_uq_doe.py.erb", gendir)
        else
          _generate("run_doe.py", "run_doe.py.erb", gendir)
          if @mda.is_root_analysis? && @mda.has_objective?
            @driver = OpenmdaoDriverFactory.new(DEFAULT_OPTIMIZATION_DRIVER).create_driver
            @sqlite_filename = options[:sqlite_filename] || "#{@mda.basename}_optimization.sqlite"
            _generate("run_optimization.py", "run_optimization.py.erb", gendir)
          end
        end
      end
      if (options[:with_runops] || @mda.is_root_analysis?) && @mda.has_design_variables?
        @sqlite_filename = options[:sqlite_filename] || "#{@mda.basename}_screening.sqlite"
        _generate("run_screening.py", "run_screening.py.erb", gendir)
      end
    end

    def _generate_test_scripts(discipline, gendir)
      @discipline = discipline  # @discipline used in template
      _generate("test_#{discipline.py_filename}", "test_discipline.py.erb", gendir)
    end
  end
end
