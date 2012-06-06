# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20120423191005) do

  create_table "instance_credentials", :force => true do |t|
    t.string  "username"
    t.binary  "password"
    t.integer "instance_id"
    t.integer "owner_id"
    t.boolean "shared"
  end

  create_table "instances", :force => true do |t|
    t.string   "name"
    t.text     "description"
    t.string   "host"
    t.integer  "port"
    t.string   "maintenance_db"
    t.datetime "created_at",     :null => false
    t.datetime "updated_at",     :null => false
    t.integer  "owner_id",       :null => false
  end

  add_index "instances", ["owner_id"], :name => "index_instances_on_owner_id"

  create_table "users", :force => true do |t|
    t.string   "username"
    t.string   "password_digest"
    t.datetime "created_at",                         :null => false
    t.datetime "updated_at",                         :null => false
    t.string   "first_name"
    t.string   "last_name"
    t.string   "email"
    t.string   "title"
    t.string   "dept"
    t.text     "notes"
    t.boolean  "admin",           :default => false
    t.datetime "deleted_at"
  end

end