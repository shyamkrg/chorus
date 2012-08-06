require 'spec_helper'

resource "Greenplum DB account for current user" do
  let!(:owner) { users(:bob) }
  let!(:non_owner) { users(:alice) }
  let!(:member) { users(:carly) }

  let!(:instance) { instances(:bobs_instance) }
  let(:instance_id) { instance.to_param }

  before do
    stub(Gpdb::ConnectionChecker).check! { true }
  end

  get "/instances/:instance_id/account" do
    before do
      log_in owner
    end

    example_request "Get personal credentials" do
      explanation <<-DESC
        The current user's personal credentials for connecting to this
        instance.  Does not return a shared account credential's, unless
        the current user is the instance owner.
      DESC

      status.should == 200
    end
  end

  post "/instances/:instance_id/account" do
    parameter :db_username, "User name for connection"
    parameter :db_password, "Password for connection"

    let(:db_username) { "big" }
    let(:db_password) { "bird_long_password" }

    required_parameters :db_username, :db_password
    scope_parameters :account, :all

    before do
      log_in non_owner
    end

    example_request "Create personal credentials" do
      status.should == 201
    end
  end

  put "/instances/:instance_id/account" do
    parameter :db_username, "User name for connection"
    parameter :db_password, "Password for connection"

    let(:db_username) { "snuffle" }
    let(:db_password) { "upagus" }

    required_parameters :db_username, :db_password
    scope_parameters :account, :all

    before do
      log_in member
    end

    example_request "Update personal credentials" do
      status.should == 200
    end
  end

  delete "/instances/:instance_id/account" do
    before do
      log_in member
    end

    example_request "Remove personal credentials" do
      status.should == 200
    end
  end
end