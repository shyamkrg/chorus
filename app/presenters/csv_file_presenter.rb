class CsvFilePresenter < Presenter
  delegate :contents, :id, to: :model
  def to_hash
    {
        :id => id,
        :contents => File.readlines(contents.path).map{ |line| line.gsub(/\n$/, '') }[0..99]
    }
  rescue
    model.errors.add(:contents, :FILE_INVALID)
    raise ActiveRecord::RecordInvalid.new(model)
  end
end