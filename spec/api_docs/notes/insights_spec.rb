require 'spec_helper'

resource "Notes" do
  let(:user) { users(:owner) }
  let(:note) { Events::NoteOnGreenplumInstance.last }
  let(:workspace) { workspaces(:public) }
  let(:note_on_workspace) { Events::NoteOnWorkspace.first }

  before do
    log_in user
    note_on_workspace.insight = true
    note_on_workspace.save!
  end

  post "/insights/promote" do
    parameter :note_id, "Id of the Note being promoted"

    let(:note_id) { note.id }

    example_request "Promote a note to insight" do
      status.should == 201
    end
  end

  post "/insights/publish" do
    parameter :note_id, "Id of the Note being published"

    let(:note_id) {note_on_workspace.id}

    example_request "Publish an insight" do
      status.should == 201
    end
  end

  post "/insights/unpublish" do
    before do
      note_on_workspace.published = true
      note_on_workspace.save!
    end
    parameter :note_id, "Id of the Note being unpublished"

    let(:note_id) {note_on_workspace.id}

    example_request "Unpublish an insight" do
      status.should == 201
    end
  end

  get "/insights" do
    parameter :workspace_id, "For entity_type of 'workspace', the id of the workspace whose activities will be returned"
    parameter :entity_type, "The type of entity whose activities will be returned, ('dashboard' or 'workspace')"
    pagination

    required_parameters :entity_type

    let(:entity_type) {"workspace"}
    let(:workspace_id) { workspace.id }

    example_request "Get the list of notes that are insights" do
      status.should == 200
    end
  end

  get "/insights/count" do
    parameter :entity_id, "For entity_type of 'workspace', the id of the workspace whose activities will be returned"
    parameter :entity_type, "The type of entity whose activities will be returned, ('dashboard' or 'workspace')"

    required_parameters :entity_type

    let(:entity_type) {"dashboard"}
    example_request "Get the number of notes that are insights" do
      status.should == 200
    end
  end
end
