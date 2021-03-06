require 'spec_helper'

resource "Hadoop" do
  let(:owner) { instance.owner }
  let!(:instance) { hadoop_instances(:hadoop) }
  let!(:dir_entry) { HdfsEntry.create!({:path => '/files', :modified_at => Time.now.to_s, :is_directory => "true", :content_count => "3", :hadoop_instance => instance}, :without_protection => true) }
  let!(:file_entry) { HdfsEntry.create!({:path => '/test.txt', :modified_at => Time.now.to_s, :size => "1234kB", :hadoop_instance => instance}, :without_protection => true ) }
  let(:hadoop_instance_id) { instance.to_param }

  before do
    log_in owner
    stub(Gpdb::ConnectionChecker).check! { true }
    stub(Hdfs::QueryService).instance_version(anything) { "1.0.0" }

    service = Object.new
    stub(Hdfs::QueryService).new(instance.host, instance.port, instance.username, instance.version) { service }
    stub(service).show('/test.txt') { ["This is such a nice file.", "It's my favourite file.", "I could read this file all day.'"] }
    stub(HdfsEntry).list('/', instance) { [dir_entry, file_entry] }
    stub(HdfsEntry).list('/files/', instance) { [file_entry] }
    stub(HdfsEntry).list('/test.txt', instance) { [file_entry] }
  end

  post "/hadoop_instances" do
    parameter :name, "Name to show Chorus users for instance"
    parameter :description, "Description of instance"
    parameter :host, "Host IP or address of Hadoop instance"
    parameter :port, "Port of Hadoop instance"
    parameter :username, "Username for connection to instance"
    parameter :group_list, "Group list for connection"

    let(:name) { "Sesame_Street" }
    let(:description) { "Can you tell me how to get..." }
    let(:host) { "sesame.street.local" }
    let(:port) { "8020" }
    let(:username) { "big" }
    let(:group_list) { "bird" }

    required_parameters :name, :host, :port, :username, :group_list

    example_request "Register a Hadoop instance" do
      status.should == 201
    end
  end

  put "/hadoop_instances/:id" do
    parameter :id, "Hadoop instance id"
    parameter :name, "Name to show Chorus users for instance"
    parameter :description, "Description of instance"
    parameter :host, "Host IP or address of Hadoop instance"
    parameter :port, "Port of Hadoop instance"
    parameter :username, "Username for connection to instance"
    parameter :group_list, "Group list for connection"

    let(:name) { "a22_Duck_Street" }
    let(:description) { "Quack!" }
    let(:host) { "duck.heroku.com" }
    let(:port) { "8121" }
    let(:username) { "donaldd" }
    let(:group_list) { "scroogemcduck" }
    let(:id) { instance.id }

    required_parameters :name, :host, :port, :username, :group_list

    example_request "Update the details on a hadoop instance" do
      status.should == 200
    end
  end

  get "/hadoop_instances" do
    pagination

    example_request "Get a list of registered Hadoop instances" do
      status.should == 200
    end
  end

  get "/hadoop_instances/:id" do
    parameter :id, "Hadoop instance id"

    let(:id) { instance.to_param }

    example_request "Get instance details"  do
      status.should == 200
    end
  end

  get "/hadoop_instances/:hadoop_instance_id/files" do
    parameter :hadoop_instance_id, "Hadoop instance id"

    example_request "Get a list of files for a specific hadoop instance's root directory"  do
      status.should == 200
    end
  end

  get "/hadoop_instances/:hadoop_instance_id/files/:id" do
    parameter :hadoop_instance_id, "Hadoop instance id"
    parameter :id, "HDFS file id"

    let(:id) { dir_entry.id }

    example_request "Get a list of files for a subdirectory of a specific hadoop instance"  do
      status.should == 200
    end
  end
end

 
