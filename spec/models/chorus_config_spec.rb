require "spec_helper"

describe ChorusConfig do
  let(:config) { ChorusConfig.new }
  before do
    stub(YAML).load_file(Rails.root.join('config/chorus.yml').to_s) do
      {
          'parent' => {'child' => 'yes'},
          'simple' => 'no',
      }
    end
    stub(YAML).load_file(Rails.root.join('config/chorus.defaults.yml').to_s) do
      {
          'simple' => 'yes!',
          'a_default' => 'maybe'
      }
    end
    stub(File).read(Rails.root.join('config/secret.key').to_s) do
      "secret_key_goes_here"
    end
  end

  it "reads the chorus.yml file" do
    config['simple'].should == 'no'
  end

  it "reads the secret.key file" do
    config['secret_key'].should == "secret_key_goes_here"
  end

  it "reads composite keys" do
    config['parent'].should == {'child' => 'yes'}
    config['parent.child'].should == 'yes'
  end

  it "falls back on values from chorus.defaults.yml" do
    config['a_default'].should == 'maybe'
  end

  it "returns nil on an undefined key" do
    config['undefined.key'].should == nil
  end

  describe "#gpfdist_configured?" do
    it "returns true if all the gpfdist keys are set" do
      config.config = {
          'gpfdist' => {
              'url' => 'localhost',
              'write_port' => 8181,
              'read_port' => 8180,
              'data_dir' => '/tmp',
              'ssl' => false
          }
      }
      config.gpfdist_configured?.should == true
    end

    it "returns false if any of the gpfdist keys are missing" do
      ['url', 'write_port', 'read_port', 'data_dir', 'ssl'].each do |gpfdist_key|
        config.config = {
            'gpfdist' => {
                'url' => 'localhost',
                'write_port' => 8181,
                'read_port' => 8180,
                'data_dir' => '/tmp',
                'ssl' => false
            }
        }
        config.config['gpfdist'].delete(gpfdist_key)
        config.should_not be_gpfdist_configured
      end
    end
  end
end
