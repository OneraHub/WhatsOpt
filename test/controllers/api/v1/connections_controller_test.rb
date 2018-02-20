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
    var = Variable.where(name: 'newvar').take
    assert_equal var.name, var.fullname
  end

  test "should fail to create connection if var name already exists" do
    post api_v1_mda_connections_url({mda_id: @mda.id, 
                                     connection: {from: @from.id, to: @to.id, names: [@varyg.name]}}), 
         as: :json, headers: @auth_headers 
    assert_match /Variable (\w+) already consumed/, JSON.parse(response.body)["message"]
    assert_response :unprocessable_entity 
  end
  
  test "should create connection from same discipline to other ones" do
    post api_v1_mda_connections_url({mda_id: @mda.id, 
                                     connection: {from: @from.id, to: @mda.driver.id, names: [@varyg.name]}}), 
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
    attrs = [:name, :type, :shape, :units, :desc]
    values = ['test', 'Integer', '(1, 2)', 'm', 'test description']
    update_attrs = attrs.zip(values).to_h
    update_attrs[:parameter_attributes] = {init: "[[1,2]]"}
    put api_v1_connection_url(@conn, {connection: update_attrs}), as: :json, headers: @auth_headers
    assert_response :success
    attrs.each_with_index do |attr, i|
      assert_equal values[i], @conn.from.send(attr)
      assert_equal values[i], @conn.to.send(attr)
    end
    assert @conn.from.name, @conn.from.fullname
    assert @conn.to.name, @conn.to.fullname
    refute @conn.from.parameter
    assert @conn.to.parameter
    assert_equal "[[1,2]]", @conn.to.parameter.init
  end  
end
