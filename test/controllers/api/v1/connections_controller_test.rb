require 'test_helper'

class Api::V1::ConnectionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    user1 = users(:user1)
    @auth_headers = {"Authorization" => "Token " + TEST_API_KEY}
    @mda = analyses(:cicav)
    @from = disciplines(:geometry)
    @to = disciplines(:aerodynamics)
    @varyg = variables(:varyg_geo_out)
    @conn = connections(:geo_aero)
    @varzout = variables(:varz_design_out)
  end
  
  test "should create a new connection" do
    post api_v1_mda_connections_url({mda_id: @mda.id, 
                                     connection: {from: @from.id, to: @to.id, names: ["newvar"]}}), 
         as: :json, headers: @auth_headers 
    assert_response :success
  end

  test "should fail to create connection if var name already exists" do
    post api_v1_mda_connections_url({mda_id: @mda.id, 
                                     connection: {from: @from.id, to: @to.id, names: [@var.name]}}), 
         as: :json, headers: @auth_headers 
    assert_match /Variable (\w+) already consumed/, JSON.parse(response.body)["message"]
    assert_response :unprocessable_entity 
  end
  
  test "should create connection from same discipline to other ones" do
    post api_v1_mda_connections_url({mda_id: @mda.id, 
                                     connection: {from: @from.id, to: @mda.driver.id, names: [@var.name]}}), 
         as: :json, headers: @auth_headers 
    assert_response :success
  end
  
  test "should raise error on bad request" do
    post api_v1_mda_connections_url({mda_id: @mda.id, 
                                     connection: {from: @from.id, to: @to.id, names: ['']}}), 
         as: :json, headers: @auth_headers 
    assert_match /can't be blank/, JSON.parse(response.body)["message"]
    assert_response :unprocessable_entity 
  end
      
  test "should delete a connection" do
    assert_difference('Variable.count', -2) do
      connyg = Connection.find_by_from_id(@varyg.id)
      delete api_v1_connection_url(connyg), as: :json, headers: @auth_headers
      assert_response :success
    end
  end

  test "should delete a connection but keep out variable if there is another connection" do
    connz = Connection.where(from_id: @varzout.id)
    assert_equal 2, connz.count
    connz1 = connz.first
    connz2 = connz.second
    assert_difference('Variable.count', -1) do
      delete api_v1_connection_url(connz1), as: :json, headers: @auth_headers
      assert_response :success
    end
  end
  
  test "should update a connection" do
    put api_v1_connection_url(@conn, {connection: {name: 'test', type: "Integer", shape: "(1, 2)", units: "m",
                                      desc: "test description", parameter_attributes: {init: "[[1,2]]"} }} ), 
        as: :json, headers: @auth_headers
    assert_response :success
    assert_equal 'test', @conn.from.name
  end  
end
