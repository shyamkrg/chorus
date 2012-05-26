require 'timeout'
require 'httparty'

module Hdfs
  class QueryService
    SERVICE_HOST = YAML.load_file(Rails.root.join("config", "hdfs_service.yml"))["query_service_url"]
    TIMEOUT = 5.0 # second

    def self.instance_version(instance)
      new(instance).version
    end

    def initialize(instance)
      @query = {
        :host => instance.host,
        :port => instance.port,
        :username => instance.username,
      }
    end

    def version
      @version ||= load_version
    end

    def list(path)
      timeout do
        escaped_path = Rack::Utils.escape(path)
        HTTParty.get("#{SERVICE_HOST}/#{version}/list/#{escaped_path}", :query => @query)
      end
    end

    def show(path)
      timeout do
        escaped_path = Rack::Utils.escape(path)
        HTTParty.get("#{SERVICE_HOST}/#{version}/show/#{escaped_path}", :query => @query)
      end
    end

    private

    def timeout(&block)
        Timeout::timeout(TIMEOUT, &block)
    end

    def load_version
      timeout do
        HTTParty.get("#{SERVICE_HOST}/version", :query => @query)["response"]
      end
    rescue Errno::ECONNREFUSED
      nil
    rescue Timeout::Error
      nil
    end
  end
end