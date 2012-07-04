#!/bin/bash

set -e
export RAILS_ENV=integration

eval "$(rbenv init -)"
rbenv shell `cat .rbenv-version`
ruby -v | grep "jruby 1.6.7"
gem list bundler | grep bundler || gem install bundler
bundle install --binstubs=b/
b/rake db:drop db:create db:migrate --trace > $WORKSPACE/bundle.log

# start solr
b/rake sunspot:solr:run > $WORKSPACE/solr.log 2>&1 &
solr_pid=$!
echo "Solr process id is : $solr_pid"
echo $solr_pid > tmp/pids/solr-$0.pid
sleep 20

set +e

echo "Running integration tests"
b/rspec spec/integration/ 2>&1
INTEGRATION_TESTS_RESULT=$?

echo "Cleaning up solr process $solr_pid"
kill -s SIGTERM $solr_pid

exit $INTEGRATION_TESTS_RESULT