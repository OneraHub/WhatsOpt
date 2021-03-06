# frozen_string_literal: true

require "test_helper"

class ConnectionTest < ActiveSupport::TestCase
  def setup
    @mda = analyses(:cicav)
  end

  test "should get edges" do
    assert_not_empty @mda.build_edges
  end

  test "should have a role" do
    conns = Connection.joins(from: :discipline).where(disciplines: { analysis_id: @mda.id })
    assert_equal ["design_var", "design_var", "design_var", "min_objective", "response",
                  "state_var", "state_var"], conns.map(&:role).sort
  end

  test "should update init parameter without changing other attrs" do
    # conn = Connection.of_analysis(@mda).with_role(WhatsOpt::Variable::DESIGN_VAR_ROLE).take
    conn = connections(:driver_z_geo)
    assert_equal "3.14", conn.from.parameter.init
    assert_equal "1", conn.from.parameter.lower
    conn.update_connections!(parameter_attributes: { init: "2" })
    conn.reload
    assert_equal "2", conn.from.parameter.init
    conn.update_connections!(parameter_attributes: { init: "" })
    conn.reload
    assert_equal "1", conn.from.parameter.lower
  end

  test "should delete parameter when init, lower and upper are blank" do
    conn = Connection.of_analysis(@mda).with_role(WhatsOpt::Variable::DESIGN_VAR_ROLE).take
    assert_equal "3.14", conn.from.parameter.init
    conn.update_connections!(parameter_attributes: { lower: "", upper: "" })
    assert conn.from.parameter
    conn.update_connections!(parameter_attributes: { init: "" })
    conn.from.reload
    assert_nil conn.from.parameter
  end
end
