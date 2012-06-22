require 'data_migration/legacy_activity_stream'

class ActivityMigrator
  def migrate
    unless Legacy.connection.column_exists?(:edc_activity_stream, :chorus_rails_event_id)
      Legacy.connection.add_column :edc_activity_stream, :chorus_rails_event_id, :integer
    end

    Legacy::ActivityStream.all.each do |activity_stream|
      mapper = ActivityStreamEventMapper.new(activity_stream)
      next unless mapper.can_build?

      event = mapper.build_event

      event.workspace = find_workspace(activity_stream)
      event.actor = find_actor(activity_stream)

      event.save!

      activity_stream.update_event_id(event.id)
    end
  end

  private

  def find_workspace(activity_stream)
    workspace_id = activity_stream.chorus_rails_workspace_id
    workspace_id.present? ? Workspace.find_with_destroyed(workspace_id) : nil
  end

  def find_actor(activity_stream)
    user_id = activity_stream.user_id
    user_id.present? ? User.find_with_destroyed(user_id) : nil
  end
end