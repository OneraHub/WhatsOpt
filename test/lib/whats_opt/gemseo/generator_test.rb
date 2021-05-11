# frozen_string_literal: true

require "test_helper"
require "whats_opt/gemseo/generator"
require "tmpdir"

module Gemseo
  class GeneratorTest < ActiveSupport::TestCase
    def thrift?
      @found ||= find_executable("thrift")
    end

    def setup
      @mda = analyses(:cicav)
      @ggen = WhatsOpt::Gemseo::Generator.new(@mda)
    end

    test "should generate gemseo component for a given discipline in mda" do
      Dir.mktmpdir do |dir|
        disc = @mda.disciplines[0]
        filepath = @ggen._generate_discipline disc, dir
        assert File.exist?(filepath)
        assert_match(/(\w+)_base\.py/, filepath)
      end
    end

    test "should generate gemseo process for an mda" do
      Dir.mktmpdir do |dir|
        @ggen._generate_code dir,  with_server: false
        assert File.exist?(@ggen.genfiles.first)
      end
    end

    def _assert_file_generation(expected, with_server: true, with_runops: true, with_run: true, with_unittests: false)
      Dir.mktmpdir do |dir|
        @ggen._generate_code(dir, with_server: with_server, with_runops: with_runops, with_run: with_run, with_unittests: with_unittests)
        dirpath = Pathname.new(dir)
        basenames = @ggen.genfiles.map { |f| Pathname.new(f).relative_path_from(dirpath).to_s }.sort
        expected = (expected).sort
        assert_equal expected, basenames
      end
    end

    test "should maintain a list of generated filepaths without server" do
      expected = ["__init__.py", "aerodynamics.py", "aerodynamics_base.py", "cicav.py",
                  "cicav_base.py", "geometry.py", "geometry_base.py", "propulsion.py", "propulsion_base.py",
                  "run_analysis.py", "run_doe.py", "run_optimization.py", "run_parameters_init.py"]
      _assert_file_generation expected, with_server: false
    end

    test "should maintain a list of generated filepaths without server and without optim nor doe" do
      obj = disciplines(:geometry).output_variables.where(name: "obj")
      Connection.where(from: obj).update(role: WhatsOpt::Variable::RESPONSE_ROLE)
      expected = ["__init__.py", "aerodynamics.py", "aerodynamics_base.py", "cicav.py",
                  "cicav_base.py", "geometry.py", "geometry_base.py", "propulsion.py", "propulsion_base.py",
                  "run_analysis.py", "run_parameters_init.py"]
      _assert_file_generation expected, with_server: false
    end

    test "should maintain a list of generated filepaths with optimization" do
      expected = ["__init__.py", "aerodynamics.py", "aerodynamics_base.py", "cicav.py",
                  "cicav_base.py", "geometry.py", "geometry_base.py", "propulsion.py", "propulsion_base.py",
                  "run_analysis.py", "run_doe.py", "run_optimization.py", "run_parameters_init.py"]
      _assert_file_generation expected, with_server: false
    end

    test "should generate gemseo mda zip file" do
      zippath = Tempfile.new("test_mda_file.zip")
      File.open(zippath, "wb") do |f|
        content, _ = @ggen.generate with_server: false
        f.write content
      end
      assert File.exist?(zippath)
      Zip::File.open(zippath) do |zip|
        zip.each do |entry|
          assert entry.file?
        end
      end
    end

  end
end