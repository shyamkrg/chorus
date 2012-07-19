require "spec_helper"

describe EventPresenter, :type => :view do
  let(:instance) { FactoryGirl.create(:instance) }

  describe "#to_hash" do
    subject { EventPresenter.new(event, view) }

    context "Non-note event" do
      let(:event) { FactoryGirl.create(:greenplum_instance_created_event, :greenplum_instance => instance) }

      it "includes the 'id', 'timestamp', 'actor', 'action'" do
        hash = subject.to_hash
        hash[:id].should == event.id
        hash[:timestamp].should == event.created_at
        hash[:action].should == "GREENPLUM_INSTANCE_CREATED"
        hash[:actor].should  == Presenter.present(event.actor, view)
      end

      it "presents all of the event's 'targets', using the same names" do
        special_instance = FactoryGirl.build(:instance)
        special_user = FactoryGirl.build(:user)

        stub(event).targets do
          {
              :special_instance => special_instance,
              :special_user => special_user
          }
        end

        hash = subject.to_hash
        hash[:special_instance].should == Presenter.present(special_instance, view)
        hash[:special_user].should == Presenter.present(special_user, view)
      end

      it "includes all of the event's 'additional data'" do
        stub(event).additional_data do
          {
              :some_key => "foo",
              :some_other_key => "bar"
          }
        end

        hash = subject.to_hash
        hash[:some_key].should == "foo"
        hash[:some_other_key].should == "bar"
      end
    end

    context "Note event" do
      let(:event) { FactoryGirl.create(:note_on_greenplum_instance_event) }

      it "returns the correct hash for a note" do
        hash = subject.to_hash
        hash[:action].should == "NOTE"
        hash[:action_type].should == "NOTE_ON_GREENPLUM_INSTANCE"
      end

      it "sanitizes notes' body" do
        stub(event).additional_data do
          {
              :body => "<script>foo</script>"
          }
        end

        hash = subject.to_hash
        hash[:body].should_not include('<')
        hash[:body].should_not include('>')
      end

      it "allows links" do
        stub(event).additional_data do
          {
              :body => "<a href='http://google.com'>foo</a>"
          }
        end

        hash = subject.to_hash
        hash[:body].should include('<')
        hash[:body].should include('>')
      end
    end
  end
end