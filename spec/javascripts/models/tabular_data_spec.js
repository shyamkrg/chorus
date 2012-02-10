describe("chorus.models.TabularData", function() {
    beforeEach(function() {
        this.tabularData = fixtures.tabularData();
    })

    context("when the tabularData is initialized with an Id, but no instance, database or schema", function() {
        it("aliases the id to 'entityId'", function() {
            this.tabularData = new chorus.models.TabularData({ id: '45|whirling_tops|diamonds|foo|japanese_teas' });
            expect(this.tabularData.entityId).toBe('45|whirling_tops|diamonds|foo|japanese_teas');
        });
    });

    //TODO: Remove after API story is done: https://www.pivotaltracker.com/story/show/24741875
    context("when the tabularData is initialized with an instance, database and schema, but no id", function() {
        it("initializes its 'entityId' correctly", function() {
            this.tabularData = new chorus.models.TabularData({
                instance: {id: '45'},
                databaseName: 'whirling_tops',
                schemaName: 'diamonds',
                objectType: 'foo',
                objectName: 'japanese_teas'
            });
            expect(this.tabularData.entityId).toBe("45|whirling_tops|diamonds|foo|japanese_teas");
        });
    });

    describe("#statistics", function() {
        beforeEach(function() {
            this.tabularDataProperties = this.tabularData.statistics()
        })

        it("returns an instance of DatabaseObjectStatistics", function() {
            expect(this.tabularDataProperties).toBeA(chorus.models.DatabaseObjectStatistics)
        })

        it("should memoize the result", function() {
            expect(this.tabularDataProperties).toBe(this.tabularData.statistics());
        })

        it("sets the properties correctly", function() {
            expect(this.tabularDataProperties.get('instanceId')).toBe(this.tabularData.get('instance').id)
            expect(this.tabularDataProperties.get('databaseName')).toBe(this.tabularData.get("databaseName"))
            expect(this.tabularDataProperties.get('schemaName')).toBe(this.tabularData.get("schemaName"))
            expect(this.tabularDataProperties.get('type')).toBe(this.tabularData.get("type"))
            expect(this.tabularDataProperties.get('objectType')).toBe(this.tabularData.get("objectType"))
            expect(this.tabularDataProperties.get('objectName')).toBe(this.tabularData.get("objectName"))
        })
    })

    describe("iconFor", function() {
        var expectedMap = {
            "CHORUS_VIEW": {
                "QUERY": "view_large.png"
            },

            "SOURCE_TABLE": {
                "BASE_TABLE": "source_table_large.png",
                "EXTERNAL_TABLE": "source_table_large.png",
                "MASTER_TABLE": "source_table_large.png",
                "VIEW": "source_view_large.png"
            },

            "SANDBOX_TABLE": {
                "BASE_TABLE": "table_large.png",
                "EXTERNAL_TABLE": "table_large.png",
                "MASTER_TABLE": "table_large.png",
                "VIEW": "view_large.png",
                "HDFS_EXTERNAL_TABLE": "table_large.png"
            }
        }

        _.each(expectedMap, function(subMap, type) {
            _.each(subMap, function(filename, objectType) {
                it("works for type " + type + " and objectType " + objectType, function() {
                    expect(fixtures.tabularData({ type: type, objectType: objectType}).iconUrl()).toBe("/images/" + expectedMap[type][objectType]);
                })
            })
        })
    })

    describe("#schema", function() {
        it("returns a new schema with the right attributes", function() {
            var schema = this.tabularData.schema();

            expect(schema.get("instanceId")).toBe(this.tabularData.get("instance").id);
            expect(schema.get("databaseName")).toBe(this.tabularData.get("databaseName"));
            expect(schema.get("name")).toBe(this.tabularData.get("schemaName"));
        });
    });

    describe("#lastComment", function() {
        beforeEach(function() {
            this.model = fixtures.tabularData();
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

        context("when the data doesn't have any comments", function() {
            it("returns null", function() {
                expect(fixtures.tabularData({recentComment: null}).lastComment()).toBeFalsy();
            });
        });
    });

    describe("#metaType", function() {
        var expectedTypeMap = {
            "BASE_TABLE": "table",
            "VIEW": "view",
            "QUERY": "query",
            "EXTERNAL_TABLE": "table",
            "MASTER_TABLE": "table",
            "CHORUS_VIEW": "view"
        }

        _.each(expectedTypeMap, function(str, type) {
            it("works for " + type, function() {
                expect(fixtures.tabularData({ objectType: type }).metaType()).toBe(str)
            });
        })
    });

    describe("#entity_type", function() {
        var expectedEntityTypeMap = {
            "SOURCE_TABLE": "databaseObject",
            "SANDBOX_TABLE": "databaseObject",
            "CHORUS_VIEW": "chorusView"
        }

        _.each(expectedEntityTypeMap, function(str, type) {
            it("works for " + type, function() {
                expect(fixtures.tabularData({ type: type }).getEntityType()).toBe(str);
            });
        })
    })

    describe("the entity_type object attribute", function() {
        it("is recalculated when the 'type' attribute is changed", function() {
            expect(this.tabularData.entityType).toBe("databaseObject");
            this.tabularData.set({ type: "CHORUS_VIEW" })
            expect(this.tabularData.entityType).toBe("chorusView");
        })
    })

    describe("#preview", function() {
        context("with a table", function() {
            beforeEach(function() {
                this.tabularData.set({objectType: "BASE_TABLE", objectName: "foo"});
                this.preview = this.tabularData.preview();
            });

            checkPreview();

            it("should return a database preview", function() {
                expect(this.preview.get("instanceId")).toBe(this.tabularData.get("instance").id);
                expect(this.preview.get("databaseName")).toBe(this.tabularData.get("databaseName"));
                expect(this.preview.get("schemaName")).toBe(this.tabularData.get("schemaName"));
                expect(this.preview.get("tableName")).toBe(this.tabularData.get("objectName"));
            });
        });

        context("with a view", function() {
            beforeEach(function() {
                this.tabularData.set({objectType: "VIEW", objectName: "bar"});
                this.preview = this.tabularData.preview();
            });

            checkPreview();

            it("should return a database preview", function() {
                expect(this.preview.get("instanceId")).toBe(this.tabularData.get("instance").id);
                expect(this.preview.get("databaseName")).toBe(this.tabularData.get("databaseName"));
                expect(this.preview.get("schemaName")).toBe(this.tabularData.get("schemaName"));
                expect(this.preview.get("viewName")).toBe(this.tabularData.get("objectName"));
            });
        });

        context("with a chorus view", function() {
            beforeEach(function() {
                this.tabularData.set({id: "2|dca_demo|some_schema|BASE_TABLE|Dataset1", objectType: "QUERY", objectName: "my_chorusview", workspace: {id:"234", name: "abc"}});
                this.preview = this.tabularData.preview();
            });

            checkPreview();

            it("should return a dataset preview", function() {
                expect(this.preview.get("workspaceId")).toBe(this.tabularData.get("workspace").id);
                expect(this.preview.get("datasetId")).toBe(this.tabularData.get("id"));
            })
        });

        function checkPreview() {
            it("should return a DatasetPreview", function() {
                expect(this.preview).toBeA(chorus.models.TabularDataPreview);
            });

            it("should memoize the database preview", function() {
                expect(this.preview).toBe(this.tabularData.preview());
            });
        }
    });

})
