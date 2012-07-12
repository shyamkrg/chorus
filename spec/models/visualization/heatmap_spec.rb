require 'spec_helper'

describe Visualization::Heatmap do
  let(:schema) { FactoryGirl.build_stubbed(:gpdb_schema, :name => 'public') }
  let(:dataset) { FactoryGirl.build_stubbed(:gpdb_table, :name => '1000_songs_test_1', :schema => schema) }
  let(:instance_account) { FactoryGirl.build_stubbed(:instance_account) }
  let(:relation) { %Q{"#{schema.name}"."#{dataset.name}"} }

  before do
    any_instance_of(Visualization::Heatmap) do |instance|
      stub(instance).fetch_min_max do
        [1.0, 10.0, 1.0, 10.0]
      end
    end
  end

  describe "#build_sql" do
    context "no filters" do
      let(:attributes) do
        {
            :x_bins => 3,
            :y_bins => 3,
            :x_axis => 'theme',
            :y_axis => 'artist'
        }
      end

      it "creates the SQL based on the grouping and bins" do
        visualization = described_class.new(dataset, attributes)
        visualization.build_min_max_sql.should == "SELECT max('theme') AS maxX, min('theme') AS minX, max('artist') AS maxY, min('artist') AS minY FROM #{relation} "
        visualization.build_row_sql.should == "SELECT *, count(*) AS value FROM ( SELECT width_bucket( CAST(\"theme\" AS numeric), CAST(1.0 AS numeric), CAST(10.0 AS numeric), 4) AS xbin, width_bucket( CAST(\"artist\" AS numeric), CAST(1.0 AS numeric), CAST(10.0 AS numeric), 6) AS ybin FROM ( SELECT * FROM \"public\".\"1000_songs_test_1\") AS subquery WHERE \"theme\" IS NOT NULL AND \"artist\" IS NOT NULL) AS foo GROUP BY xbin, ybin"
      end
    end

    #   context "with one filter" do
    #     let(:attributes) do
    #       {
    #           :bins => 20,
    #           :y_axis => 'artist',
    #           :filters => ['"1000_songs_test_1"."year" < 1980']
    #       }
    #     end

    #     it "creates the SQL based on the grouping and bins" do
    #       visualization = described_class.new(dataset, attributes)
    #       visualization.build_row_sql.should == 'SELECT  "public"."1000_songs_test_1"."artist" AS bucket, count(1) AS count ' +
    #           'FROM "public"."1000_songs_test_1"  WHERE "1000_songs_test_1"."year" < 1980 GROUP BY ' +
    #           '"public"."1000_songs_test_1"."artist" ORDER BY count DESC LIMIT 20'
    #     end
    #   end

    #   context "with more than one filter" do
    #     let(:attributes) do
    #       {
    #           :bins => 20,
    #           :y_axis => 'artist',
    #           :filters => ['"1000_songs_test_1"."year" < 1980', '"1000_songs_test_1"."year" > 1950']
    #       }
    #     end

    #     it "creates the SQL based on the grouping and bins" do
    #       visualization = described_class.new(dataset, attributes)
    #       visualization.build_row_sql.should == 'SELECT  "public"."1000_songs_test_1"."artist" AS bucket, count(1) AS count ' +
    #           'FROM "public"."1000_songs_test_1"  WHERE "1000_songs_test_1"."year" < 1980 AND "1000_songs_test_1"."year" > 1950 GROUP BY ' +
    #           '"public"."1000_songs_test_1"."artist" ORDER BY count DESC LIMIT 20'
    #     end
    #   end
  end

  describe "#fetch!" do
    before do
      mock(schema).with_gpdb_connection(instance_account) do
        [
            # some lines commented out to test filling in missing values
            {'value' => '11', 'x' => '1', 'y' => '1'},
            # { 'value' => '12', 'x' => '1', 'y' => '2'}
            {'value' => '13', 'x' => '1', 'y' => '3'},

            {'value' => '21', 'x' => '2', 'y' => '1'},
            {'value' => '22', 'x' => '2', 'y' => '2'},
            {'value' => '23', 'x' => '2', 'y' => '3'},

            # { 'value' => '31', 'x' => '3', 'y' => '1'}
            # { 'value' => '32', 'x' => '3', 'y' => '2'}
            {'value' => '33', 'x' => '3', 'y' => '3'}
        ]
      end
    end

    let(:attributes) do
      {
          :x_bins => 3,
          :y_bins => 3,
          :x_axis => 'theme',
          :y_axis => 'artist'
      }
    end

    it "returns visualization structure" do
      visualization = described_class.new(dataset, attributes)
      visualization.fetch!(instance_account)

      visualization.rows.should include({'value' => '11', 'x' => '1', 'xLabel' => [1.0, 4.0], 'y' => '1', 'yLabel' => [1.0, 4.0]})
      visualization.rows.should include({'value' => '', 'x' => '1', 'xLabel' => [1.0, 4.0], 'y' => '2', 'yLabel' => [4.0, 7.0]})
      visualization.rows.should include({'value' => '13', 'x' => '1', 'xLabel' => [1.0, 4.0], 'y' => '3', 'yLabel' => [7.0, 10.0]})
      visualization.rows.should include({'value' => '21', 'x' => '2', 'xLabel' => [4, 7], 'y' => '1', 'yLabel' => [1, 4]})
      visualization.rows.should include({'value' => '22', 'x' => '2', 'xLabel' => [4, 7], 'y' => '2', 'yLabel' => [4, 7]})
      visualization.rows.should include({'value' => '23', 'x' => '2', 'xLabel' => [4, 7], 'y' => '3', 'yLabel' => [7, 10]})
      visualization.rows.should include({'value' => '', 'x' => '3', 'xLabel' => [7, 10], 'y' => '1', 'yLabel' => [1, 4]})
      visualization.rows.should include({'value' => '', 'x' => '3', 'xLabel' => [7, 10], 'y' => '2', 'yLabel' => [4, 7]})
      visualization.rows.should include({'value' => '33', 'x' => '3', 'xLabel' => [7, 10], 'y' => '3', 'yLabel' => [7, 10]})
    end
  end
end
