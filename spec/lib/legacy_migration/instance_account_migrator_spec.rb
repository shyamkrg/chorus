require 'spec_helper'

describe InstanceAccountMigrator, :legacy_migration => true, :type => :legacy_migration do
  describe ".migrate" do
    describe "validate the number of entries migrated" do
      it "creates new InstanceAccounts from old AccountMap" do
        UserMigrator.new.migrate
        InstanceMigrator.new.migrate
        expect {
          InstanceAccountMigrator.new.migrate
        }.to change(InstanceAccount, :count).by(4)
      end
    end

    describe "copying the data" do
      before do
        UserMigrator.new.migrate
        InstanceMigrator.new.migrate
        InstanceAccountMigrator.new.migrate
      end

      it "adds the new foreign key column" do
        Legacy.connection.column_exists?(:edc_account_map, :chorus_rails_instance_account_id).should be_true
      end

      it "ignores the zombie accounts" do
        InstanceAccount.where(:db_username => "zombie").should_not be_present
      end

      it "copies the necessary fields" do
        Legacy.connection.select_all("SELECT edc_account_map.*, edc_instance.chorus_rails_instance_id, edc_user.chorus_rails_user_id
                FROM edc_account_map
                LEFT OUTER JOIN edc_instance ON edc_account_map.instance_id = edc_instance.id
                LEFT OUTER JOIN edc_user ON edc_user.user_name = edc_account_map.user_name
                WHERE edc_instance.instance_provider = 'Greenplum Database'
                ORDER BY edc_account_map.instance_id, edc_account_map.shared DESC").each do |legacy|

          if @rails_instance_id != legacy["chorus_rails_instance_id"]
            account = InstanceAccount.find(legacy["chorus_rails_instance_account_id"])
            account.db_username.should == legacy["db_user_name"]
            account.db_password.should == "secret"
            account.owner_id.should == legacy["chorus_rails_user_id"].to_i
            account.instance_id.should == legacy["chorus_rails_instance_id"].to_i
            @rails_instance_id = legacy["chorus_rails_instance_id"]
          end
        end
      end

      it "marks instances as shared when shared accounts exist" do
        Instance.find(Legacy.connection.select_one("SELECT chorus_rails_instance_id AS id FROM edc_instance WHERE id = '10020'")["id"]).should be_shared
      end
    end
  end
end