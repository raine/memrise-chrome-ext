require 'json'
require 'pp'

unless ARGV.length == 2
  raise 'Missing arguments'
end

path = ARGV.first
json = JSON.load File.read path
json['version'] = ARGV.last

File.open path, 'w+' do |f|
  f.write JSON.pretty_generate json
end
