describe("chorus.models.Dataset", function() {
    var objectWithEncodingIssues = {
        schema : {
            name: "b/a/r",
            id: 3,
            database: {
                name: "%foo%",
                id: 2,
                instance: {
                    id: 1
                }
            }
        },
        objectName: "a space"
    };

    beforeEach(function() {
        this.dataset = rspecFixtures.dataset({
            id: 45,
            schema: {
                id: 1,
                name: "ipa",
                database: {
                    "name": "beers",
                    instance: {
                        id: 12
                    }
                }
            },
            objectType: "TABLE"
        });
    });

    it("has the right urls", function() {
        expect(this.dataset.url()).toMatchUrl("/datasets/45");
        expect(this.dataset.showUrl()).toMatchUrl("#/datasets/45");
    });

    describe("when the 'invalidated' event is triggered", function() {
        describe("when the dataset belongs to a collection", function() {
            beforeEach(function() {
                this.collection = new chorus.collections.DatasetSet();
                this.collection.add(this.dataset);
            });

            it("re-fetches itself, because the last comment might have changed", function() {
                this.dataset.trigger("invalidated");
                expect(this.dataset).toHaveBeenFetched();
            });
        });

        describe("when the dataset has no collection", function() {
            it("does not fetch anything", function() {
                this.dataset.trigger("invalidated");
                expect(this.dataset).not.toHaveBeenFetched();
            });
        });
    });

    describe("#isChorusView", function() {
        it("is always false", function() {
            expect(this.dataset.isChorusView()).toBeFalsy();
        });
    });

    it("includes the InstanceCredentials mixin", function() {
        expect(this.dataset.instanceRequiringCredentials).toBe(chorus.Mixins.InstanceCredentials.model.instanceRequiringCredentials);
    });

    describe("#initialize", function() {
        it("doesn't override type when type already exists", function() {
            var model = new chorus.models.Dataset({ type: "foo"})
            expect(model.get("type")).toBe("foo")
        })

        it("sets type to datasetType if datasetType exists", function() {
            var model = new chorus.models.Dataset({ datasetType: "foo"})
            expect(model.get("type")).toBe("foo")
        })

        it("sets type to SOURCE_TABLE if neither type nor datasetType exists", function() {
            var model = new chorus.models.Dataset({})
            expect(model.get("type")).toBe("SOURCE_TABLE")
        })
    });

    describe("#statistics", function() {
        beforeEach(function() {
            this.statistics = this.dataset.statistics()
        });

        it("returns an instance of DatasetStatistics", function() {
            expect(this.statistics).toBeA(chorus.models.DatasetStatistics)
        });

        it("should memoize the result", function() {
            expect(this.statistics).toBe(this.dataset.statistics());
        });

        it("sets the properties correctly", function() {
            expect(this.statistics.get("datasetId")).toBe(this.dataset.id)
        });
    });

    describe("iconFor", function() {
        var largeIconMap = {
            "CHORUS_VIEW": {
                "QUERY": "chorus_view_large.png"
            },

            "SOURCE_TABLE": {
                "TABLE": "source_table_large.png",
                "EXTERNAL_TABLE": "source_table_large.png",
                "MASTER_TABLE": "source_table_large.png",
                "VIEW": "source_view_large.png"
            },

            "SANDBOX_TABLE": {
                "TABLE": "sandbox_table_large.png",
                "EXTERNAL_TABLE": "sandbox_table_large.png",
                "MASTER_TABLE": "sandbox_table_large.png",
                "VIEW": "sandbox_view_large.png",
                "HDFS_EXTERNAL_TABLE": "sandbox_table_large.png"
            }
        };

        var mediumIconMap = {
            "CHORUS_VIEW": {
                "QUERY": "chorus_view_medium.png"
            },

            "SOURCE_TABLE": {
                "TABLE": "source_table_medium.png",
                "EXTERNAL_TABLE": "source_table_medium.png",
                "MASTER_TABLE": "source_table_medium.png",
                "VIEW": "source_view_medium.png"
            },

            "SANDBOX_TABLE": {
                "TABLE": "sandbox_table_medium.png",
                "EXTERNAL_TABLE": "sandbox_table_medium.png",
                "MASTER_TABLE": "sandbox_table_medium.png",
                "VIEW": "sandbox_view_medium.png",
                "HDFS_EXTERNAL_TABLE": "sandbox_table_medium.png"
            }
        };

        describe("when the 'size' option is set to 'medium'", function() {
            it("returns the medium version of the icon of the appropriate type", function() {
                _.each(mediumIconMap, function(subMap, type) {
                    _.each(subMap, function(filename, objectType) {

                        var model = rspecFixtures.dataset({ type: type, objectType: objectType});
                        expect(model.iconUrl({ size: "medium" })).toBe("/images/" + filename);

                    });
                });
            });
        });

        describe("when the 'size' option is set to 'large'", function() {
            it("returns the large version of the icon of the appropriate type", function() {
                _.each(largeIconMap, function(subMap, type) {
                    _.each(subMap, function(filename, objectType) {

                        var model = rspecFixtures.dataset({ type: type, objectType: objectType});
                        expect(model.iconUrl({ size: "large" })).toBe("/images/" + filename);

                    });
                });
            });
        });

        describe("when no 'size' option is given", function() {
            it("returns the large version of the icon of the appropriate type", function() {
                _.each(largeIconMap, function(subMap, type) {
                    _.each(subMap, function(filename, objectType) {

                        var model = rspecFixtures.dataset({ type: type, objectType: objectType});
                        expect(model.iconUrl()).toBe("/images/" + filename);

                    });
                });
            });
        });
    })

    describe("#canBeImportSource", function() {
        it("returns true if the object is a Dataset (with a workspace id) but not a Sandbox Dataset", function() {
            var table = rspecFixtures.dataset();
            expect(table.canBeImportSource()).toBeFalsy();

            var dataset = newFixtures.workspaceDataset.sandboxTable();
            expect(dataset.canBeImportSource()).toBeFalsy();

            dataset = newFixtures.workspaceDataset.sandboxView();
            expect(dataset.canBeImportSource()).toBeFalsy();

            dataset = newFixtures.workspaceDataset.sourceTable();
            expect(dataset.canBeImportSource()).toBeTruthy();

            dataset = rspecFixtures.workspaceDataset.datasetTable();
            expect(dataset.canBeImportSource()).toBeTruthy();

            dataset = newFixtures.workspaceDataset.chorusView();
            expect(dataset.canBeImportSource()).toBeTruthy();
        });
    });

    describe("#canBeImportDestination", function() {
        it("returns true if the object is a Dataset (with a workspace id)", function() {
            var table = rspecFixtures.dataset();
            expect(table.canBeImportDestination()).toBeFalsy();

            var dataset = newFixtures.workspaceDataset.sandboxTable();
            expect(dataset.canBeImportDestination()).toBeTruthy();

            dataset = newFixtures.workspaceDataset.sandboxView();
            expect(dataset.canBeImportDestination()).toBeTruthy();

            dataset = newFixtures.workspaceDataset.sourceTable();
            expect(dataset.canBeImportDestination()).toBeTruthy();

            dataset = rspecFixtures.workspaceDataset.datasetTable();
            expect(dataset.canBeImportDestination()).toBeTruthy();

            dataset = newFixtures.workspaceDataset.chorusView();
            expect(dataset.canBeImportDestination()).toBeTruthy();
        });
    });

    describe("#instance", function() {
        beforeEach(function() {
            this.instance = this.dataset.instance();
        });

        it("returns an instance with the right id and name", function() {
            expect(this.instance).toBeA(chorus.models.GreenplumInstance);

            expect(this.instance.id).toBe(this.dataset.get("schema").database.instance.id);
            expect(this.instance.name()).toBe(this.dataset.get("schema").database.instance.name);
        });
    });

    describe("#database", function() {
        it("returns a new database with the right attributes", function() {
            expect(this.dataset.database().name()).toBe(this.dataset.get("schema").database.name);
        });
    });

    describe("#schema", function() {
        it("returns a new schema with the right attributes", function() {
            expect(this.dataset.schema().name()).toBe(this.dataset.get("schema").name);
        });
    });

    xdescribe("#lastComment", function() {
        beforeEach(function() {
            this.model = rspecFixtures.dataset();
            this.comment = this.model.lastComment();
            this.lastCommentJson = this.model.get('recentComment');
        });

        it("has the right body", function() {
            expect(this.comment.get("body")).toBe(this.lastCommentJson.text);
        });

        it("has the right creator", function() {
            var creator = this.comment.author()
            expect(creator.get("id")).toBe(this.lastCommentJson.author.id);
            expect(creator.get("firstName")).toBe(this.lastCommentJson.author.firstName);
            expect(creator.get("lastName")).toBe(this.lastCommentJson.author.lastName);
        });

        it("is loaded", function() {
            expect(this.comment.loaded).toBeTruthy();
        });

        context("when the data doesn't have any comments", function() {
            it("returns null", function() {
                expect(rspecFixtures.dataset({recentComment: null}).lastComment()).toBeFalsy();
            });
        });
    });

    describe("#metaType", function() {
        var expectedTypeMap = {
            "TABLE": "table",
            "VIEW": "view",
            "QUERY": "query",
            "EXTERNAL_TABLE": "table",
            "MASTER_TABLE": "table",
            "CHORUS_VIEW": "view"
        }

        _.each(expectedTypeMap, function(str, type) {
            it("works for " + type, function() {
                expect(rspecFixtures.dataset({ objectType: type }).metaType()).toBe(str)
            });
        })
    });

    describe("#preview", function() {
        context("with a table", function() {
            beforeEach(function() {
                this.dataset.set({objectType: "TABLE", objectName: "foo"});
                this.preview = this.dataset.preview();
            });

            checkPreview();

            it("should return a database preview", function() {
                expect(this.preview).toBeA(chorus.models.DataPreviewTask);
                expect(this.preview.get("dataset").id).toBe(this.dataset.id);
            });
        });

        context("with a view", function() {
            beforeEach(function() {
                this.dataset.set({objectType: "VIEW", objectName: "bar"});
                this.preview = this.dataset.preview();
            });

            checkPreview();

            it("should return a database preview", function() {
                expect(this.preview).toBeA(chorus.models.DataPreviewTask);
                expect(this.preview.get("dataset").id).toBe(this.dataset.id);
            });
        });

        context("with a chorus view", function() {
            beforeEach(function() {
                this.dataset = newFixtures.workspaceDataset.chorusView({
                    query: "select * from hello_world",
                    objectName: "my_chorusview",
                    workspace: {id: "234", name: "abc"}
                });
                this.preview = this.dataset.preview();
            });

            checkPreview();

            it("should return a dataset preview", function() {
                expect(this.preview).toBeA(chorus.models.ChorusViewPreviewTask);
                expect(this.preview.get("workspaceId")).toBe("234");
                expect(this.preview.get("instanceId")).toBe(this.dataset.instance().id);
                expect(this.preview.get("databaseName")).toBe(this.dataset.database().name());
                expect(this.preview.get("schemaName")).toBe(this.dataset.schema().name());
                expect(this.preview.get("query")).toBe("select * from hello_world");
            });
        });

        context("with a chorus view (from search API)", function() {
            beforeEach(function() {
                this.dataset = newFixtures.workspaceDataset.chorusViewSearchResult({
                    content: "select * from hello_world",
                    objectName: "my_chorusview",
                    workspace: {id: "234", name: "abc"}
                });
                this.dataset.set({ type: "CHORUS_VIEW" });
                this.preview = this.dataset.preview();
            });

            checkPreview();

            it("should return a dataset preview", function() {
                expect(this.preview).toBeA(chorus.models.ChorusViewPreviewTask);
                expect(this.preview.get("workspaceId")).toBe("234");
                expect(this.preview.get("instanceId")).toBe(this.dataset.instance().id);
                expect(this.preview.get("databaseName")).toBe(this.dataset.database().name());
                expect(this.preview.get("schemaName")).toBe(this.dataset.schema().name());
                expect(this.preview.get("query")).toBe("select * from hello_world");
            });
        });

        function checkPreview() {
            it("should return a Task", function() {
                expect(this.preview).toBeA(chorus.models.Task);
                expect(this.preview.get("checkId")).not.toBeUndefined();
            });

            it("should not memoize the database preview", function() {
                expect(this.preview).not.toBe(this.dataset.preview());
            });
        }
    });

    describe("#download", function() {
        beforeEach(function() {
            this.dataset.set({ id: '"foo"|"bar"|"baz"' });
            spyOn(jQuery, "download");
        });

        context("when no number of rows is passed", function() {
            it("includes the number of rows", function() {
                this.dataset.download();
                expect($.download).toHaveBeenCalledWith("/data/csvDownload", {
                    datasetId: this.dataset.id
                }, "get");
            });
        });

        context("when a number of rows is passed", function() {
            it("makes a request to the tabular data download api", function() {
                this.dataset.download({ rows: "345" });
                expect($.download).toHaveBeenCalledWith("/data/csvDownload", {
                    datasetId: this.dataset.id,
                    numOfRows: "345"
                }, "get");
            });
        });
    });

    describe("#columns", function() {
        it("should memoize the result", function() {
            expect(this.dataset.columns()).toBe(this.dataset.columns());
        });

        it("should return a DatabaseColumnSet", function() {
            expect(this.dataset.columns()).toBeA(chorus.collections.DatabaseColumnSet);
        })

        it("should pass the correct parameters to the DatabaseColumnSet", function() {
            var columns = this.dataset.columns();
            expect(columns.attributes.id).toBe(this.dataset.id);
        });

        it("has a reference back to the dataset", function() {
            var columns = this.dataset.columns();
            expect(columns.dataset).toBe(this.dataset);
        });

        context("when the object has a metaType of 'query'", function() {
            beforeEach(function() {
                spyOn(this.dataset, 'metaType').andReturn('query');
                this.dataset.set({ id: "ID" });
            });

            it("has a queryName of the dataset id", function() {
                var columns = this.dataset.columns();
                expect(columns.attributes.queryName).toBe(this.dataset.get('id'));
            });
        });

        context("when the object is a table", function() {
            beforeEach(function() {
                this.dataset.set({ objectType: "SOURCE_TABLE" });
            });

            it("passes its name to the column set as 'tableName'", function() {
                var columns = this.dataset.columns();
                expect(columns.attributes.tableName).toBe(this.dataset.name());
                expect(columns.attributes.viewName).toBeFalsy();
            });
        });

        context("when the object is a view", function() {
            beforeEach(function() {
                this.dataset.set({ objectType: "VIEW" });
            });

            it("passes its name to the column set as 'viewName'", function() {
                var columns = this.dataset.columns();
                expect(columns.attributes.viewName).toBe(this.dataset.name());
                expect(columns.attributes.tableName).toBeFalsy();
            });
        });
    });

    describe("#quotedName", function() {
        beforeEach(function() {
            this.dataset.set({objectName: "My_Object"});
        });

        it("uses the safePGName helper", function() {
            expect(this.dataset.quotedName()).toBe(chorus.Mixins.dbHelpers.safePGName(this.dataset.name()));
        });
    });

    describe("#toText", function() {
        context("with lowercase names", function() {
            beforeEach(function() {
                this.dataset.set({objectName: "tabler", schema: {name: "party_schema"} })
            });

            it("formats the string to put into the sql editor", function() {
                expect(this.dataset.toText()).toBe('party_schema.tabler');
            });
        });

        context("with uppercase names", function() {
            beforeEach(function() {
                this.dataset.set({objectName: "Tabler", schema: {name: "PartyMAN"}});
            });

            it("puts quotes around the uppercase names", function() {
                expect(this.dataset.toText()).toBe('"PartyMAN"."Tabler"');
            });
        });

        context("with chorus view", function() {
            beforeEach(function() {
                this.dataset = fixtures.chorusView({objectName: "ChorusView", query: "SELECT a,b FROM xyz;"});
            });

            it("creates an appropriate string (trimmed, remove semicolon, and alias to pg-quoted CV name)", function() {
                expect(this.dataset.toText()).toBe('(SELECT a,b FROM xyz) AS "ChorusView"');
            });
        });
    });

    describe("#selectName", function() {
        context("when a datasetNumber is not set", function() {
            it("returns the quotedName", function() {
                expect(this.dataset.selectName()).toBe(this.dataset.quotedName());
            });
        });

        context("when a datasetNumber is set", function() {
            beforeEach(function() {
                this.dataset.setDatasetNumber(1);
            });

            it("returns the alias", function() {
                expect(this.dataset.selectName()).toBe("a");
            });
        });
    });

    describe("#fromClause", function() {
        context("when a datasetNumber is not set", function() {
            it("returns the quoted schema name and table name", function() {
                expect(this.dataset.fromClause()).toBe(this.dataset.schema().name() + "." + this.dataset.quotedName());
            });
        });

        context("when a datasetNumber is set", function() {
            beforeEach(function() {
                this.dataset.setDatasetNumber(1);
            });

            it("returns the aliased from clause", function() {
                expect(this.dataset.fromClause()).toBe(this.dataset.schema().name() + "." + this.dataset.quotedName() + " AS a");
            });
        });

        context("when the model has a 'query'", function() {
            beforeEach(function() {
                this.dataset = newFixtures.workspaceDataset.chorusView();
            })

            context("when a datasetNumber is not set", function() {
                it("returns the query aliased as the objectName", function() {
                    var expectedFrom = "(" + this.dataset.get('query') + ') AS ' + this.dataset.quotedName();
                    expect(this.dataset.fromClause()).toBe(expectedFrom);
                });
            });

            context("when a datasetNumber is set", function() {
                beforeEach(function() {
                    this.dataset.setDatasetNumber(1);
                });

                it("returns the query aliased as the aliasedName", function() {
                    var expectedFrom = "(" + this.dataset.get('query') + ') AS ' + this.dataset.aliasedName;
                    expect(this.dataset.fromClause()).toBe(expectedFrom);
                });
            });
        });
    });

    describe("#workspace", function() {
        it("is a chorus.models.Workspace", function() {
            expect(this.dataset.workspace()).toBeA(chorus.models.Workspace);
        });
    });

    describe("#workspacesAssociated", function() {
        context("when there are workspaces associated", function() {
            beforeEach(function() {
                this.dataset = rspecFixtures.dataset({associatedWorkspaces:
                    [
                        {id: "43", name: "working_hard"},
                        {id: "54", name: "hardly_working"}
                    ]
                });

            });
            it("returns a workspace set with the right data", function() {
                var workspaces = this.dataset.workspacesAssociated();
                expect(workspaces).toBeA(chorus.collections.WorkspaceSet);
                expect(workspaces.length).toBe(2);
                expect(workspaces.at(0).get("id")).toBe("43");
                expect(workspaces.at(1).get("id")).toBe("54");
                expect(workspaces.at(0).get("name")).toBe("working_hard");
                expect(workspaces.at(1).get("name")).toBe("hardly_working");
            });
        });

        context("when there are NOT workspaces associated", function() {
            beforeEach(function() {
                this.dataset.unset("associatedWorkspaces");
                delete this.dataset._workspaceAssociated;
            });
            it("returns an empty workspaceSet", function() {
                var workspaces = this.dataset.workspacesAssociated();
                expect(workspaces.length).toBe(0);
            });
        });

        describe("when the associatedWorkspaces attribute is changed", function() {
            beforeEach(function() {
                this.dataset.unset("associatedWorkspaces");
                delete this.dataset._workspaceAssociated;
                this.oldWorkspaces = this.dataset.workspacesAssociated();
                expect(this.oldWorkspaces.length).toBe(0);

                this.dataset.set({associatedWorkspaces:
                    [
                        {id: "43", name: "working_hard"},
                        {id: "54", name: "hardly_working"}
                    ]
                });
            });

            it("is invalidated", function() {
                expect(this.dataset.workspacesAssociated()).not.toEqual(this.oldWorkspaces);
                expect(this.dataset.workspacesAssociated().length).toBe(2);
            });
        });
    });

    describe("#setDatasetNumber", function() {
        beforeEach(function() {
            this.dataset.setDatasetNumber(4)
        })

        it("sets the datasetNumber", function() {
            expect(this.dataset.datasetNumber).toBe(4);
        })

        it("sets the aliasedName", function() {
            expect(this.dataset.aliasedName).toBe('d');
        })
    });

    describe("#clearDatasetNumber", function() {
        beforeEach(function() {
            this.dataset.setDatasetNumber(4)
            this.dataset.clearDatasetNumber()
        })

        it("unsets the datasetNumber", function() {
            expect(this.dataset.datasetNumber).toBeUndefined();
        })

        it("unsets the aliasedName", function() {
            expect(this.dataset.aliasedName).toBeUndefined();
        })
    })

    describe("#isDeleteable", function() {
        it("is true when the tabular data is a source table", function() {
            expect(newFixtures.workspaceDataset.sourceTable().isDeleteable()).toBeTruthy();
        });

        it("is true when the tabular data is a source view", function() {
            expect(rspecFixtures.workspaceDataset.datasetTable().isDeleteable()).toBeTruthy();
        });

        it("is true when the tabular data is a chorus view", function() {
            expect(newFixtures.workspaceDataset.chorusView().isDeleteable()).toBeTruthy();
        });

        it("is false otherwise", function() {
            expect(newFixtures.workspaceDataset.sandboxTable().isDeleteable()).toBeFalsy();
        });
    });

    describe("#makeBoxplotTask", function() {
        beforeEach(function() {
            this.task = this.dataset.makeBoxplotTask({
                xAxis: "dog_breed",
                yAxis: "blindness_rate"
            });
        });

        it("returns a BoxplotTask model", function() {
            expect(this.task).toBeA(chorus.models.BoxplotTask);
        });

        it("has the dataset", function() {
            expect(this.task.dataset).toBe(this.dataset);
        });
    });

    describe("#makeHistogramTask", function() {
        beforeEach(function() {
            this.task = this.dataset.makeHistogramTask({
                bins: 5,
                xAxis: "blindness_rate"
            });
        });

        it("returns a HistogramTask model", function() {
            expect(this.task).toBeA(chorus.models.HistogramTask);
        });

        it("has the given number of bins and y axis", function() {
            expect(this.task.get("bins")).toBe(5);
            expect(this.task.get("xAxis")).toBe("blindness_rate");
        });

        it("has the dataset", function() {
            expect(this.task.dataset).toBe(this.dataset);
        });
    });

    describe("#makeHeatmapTask", function() {
        beforeEach(function() {
            this.task = this.dataset.makeHeatmapTask({
                xBins: 5,
                yBins: 6,
                xAxis: "dog_breed",
                yAxis: "blindness_rate"
            });
        });

        it("returns a HeatmapTask model", function() {
            expect(this.task).toBeA(chorus.models.HeatmapTask);
        });

        it("has the given number of bins and y axis", function() {
            expect(this.task.get("xBins")).toBe(5);
            expect(this.task.get("yBins")).toBe(6);
            expect(this.task.get("xAxis")).toBe("dog_breed");
            expect(this.task.get("yAxis")).toBe("blindness_rate");
        });

        it("has the dataset", function() {
            expect(this.task.dataset).toBe(this.dataset);
        });
    });

    describe("#makeFrequencyTask", function() {
        beforeEach(function() {
            this.task = this.dataset.makeFrequencyTask({
                yAxis: "blindness_rate",
                bins: "12"
            });
        })

        it("returns a FrequencyTask model", function() {
            expect(this.task).toBeA(chorus.models.FrequencyTask);
        });

        it("has the given y axis", function() {
            expect(this.task.get("yAxis")).toBe("blindness_rate");
        });

        it("has the dataset and bins", function() {
            expect(this.task.dataset).toBe(this.dataset);
            expect(this.task.get("bins")).toBe("12")
        });
    })

    describe("#makeTimeseriesTask", function() {
        beforeEach(function() {
            this.task = this.dataset.makeTimeseriesTask({
                xAxis: "years",
                yAxis: "height_in_inches",
                aggregation: "sum",
                timeInterval: "minute",
                timeType: "datetime"
            });
        });

        it("returns a TimeseriesTask model", function() {
            expect(this.task).toBeA(chorus.models.TimeseriesTask);
        });

        it("has the given x axis", function() {
            expect(this.task.get("xAxis")).toBe("years");
            expect(this.task.get("aggregation")).toBe("sum");
            expect(this.task.get("timeInterval")).toBe("minute");
        });

        it("has the given y axis", function() {
            expect(this.task.get("yAxis")).toBe("height_in_inches");
        });

        it("has the dataset", function() {
            expect(this.task.dataset).toBe(this.dataset);
        });

        it("has the right timeType", function() {
            expect(this.task.get("timeType")).toBe('datetime')
        })
    });

    describe("#asDataset", function() {
        it("converts the object to a dataset", function() {
            var dataset = this.dataset.asWorkspaceDataset();
            expect(dataset).toBeA(chorus.models.WorkspaceDataset);
            expect(dataset.attributes).toEqual(this.dataset.attributes);
        });
    });

    describe("#canAnalyze", function() {
        it("returns true for a sandbox table", function() {
            this.dataset = newFixtures.workspaceDataset.sandboxTable();
            expect(this.dataset.canAnalyze()).toBeTruthy();
        });

        it("returns true for a source table", function() {
            this.dataset = rspecFixtures.dataset();
            expect(this.dataset.canAnalyze()).toBeTruthy();
        });

        it("returns false for views", function() {
            this.dataset = newFixtures.workspaceDataset.sandboxView();
            expect(this.dataset.canAnalyze()).toBeFalsy();
        });

        it("returns false for Chorus views", function() {
            this.dataset = fixtures.chorusView();
            expect(this.dataset.canAnalyze()).toBeFalsy();
        });

        it("returns false for external tables", function() {
            this.dataset = newFixtures.workspaceDataset.externalTable();
            expect(this.dataset.canAnalyze()).toBeFalsy();
        });
    });

    describe("Analyze", function() {
        beforeEach(function() {
            this.dataset = rspecFixtures.dataset({
                id: 543
            });
        });

        it("returns a DatasetAnalyze model", function() {
            expect(this.dataset.analyze()).toBeA(chorus.models.DatasetAnalyze);
        });

        it("memoizes", function() {
            expect(this.dataset.analyze()).toBe(this.dataset.analyze());
        });

        it("returns an analyze model with the right url", function() {
            expect(this.dataset.analyze().url()).toBe("/tables/543/analyze")
        });
    });
});