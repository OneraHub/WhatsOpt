# frozen_string_literal: true

require "test_helper"

class Api::V1::OpenmdaoCheckingControllerTest < ActionDispatch::IntegrationTest
  setup do
    @auth_headers = { "Authorization" => "Token " + TEST_API_KEY }
    @mda = analyses(:cicav)
  end

  test "should run openmdao checking" do
    post api_v1_mda_openmdao_checking_url(@mda), as: :json, headers: @auth_headers
    assert_response :success
  end
end
