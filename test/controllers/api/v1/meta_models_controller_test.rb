# frozen_string_literal: true

require "test_helper"

class Api::V1::MetaModelsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @mda = analyses(:cicav)
    @ope = operations(:doe)
    @user = users(:user1)
    @auth_headers = { "Authorization" => "Token " + @user.api_key }
    @user2 = users(:user2)
  end

  teardown do
    WhatsOpt::SurrogateProxy.shutdown_server
  end

  test "should use a metamodel" do
    mm = meta_models(:cicav_metamodel)
    put api_v1_meta_model_url(mm), params: { meta_model: {
        format: "matrix", values: [[3, 5, 7], [6, 10, 1]]
      } }, as: :json, headers: @auth_headers
    assert_response :success
    resp = JSON.parse(response.body)
    responses = resp["responses"]
    assert_in_delta(2.32, responses[0][0])
    assert_in_delta(7.841, responses[1][0])
  end

  test "anybody can make prediction" do
    mm = meta_models(:cicav_metamodel)
    @auth_headers = { "Authorization" => "Token " + @user2.api_key }
    put api_v1_meta_model_url(mm), params: { meta_model: {
        format: "matrix", values: [[3, 5, 7], [6, 10, 1]]
      } }, as: :json, headers: @auth_headers
    assert_response :success
  end
end
