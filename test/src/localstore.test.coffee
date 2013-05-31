get = (key) ->
	localStorage.getItem key

suite 'localStore', ->
	suite 'initialization', ->
		test 'should initialize with prefix', ->
			ls = new LocalStore 'settings'
			assert.equal ls.prefix, 'ls.settings.'

	suite 'writeObj()', ->
		setup ->
			localStorage.clear()

			ls = new LocalStore 'settings'
			ls.writeObj
				name: 'Sigrid'
				phone: '555-123123'
				contacts: [
					name: 'John'
				]

		test 'should save object to localStorage with JSON encoded values', ->
			assert.equal get('ls.settings.name'), '"Sigrid"'
			assert.deepEqual JSON.parse(get('ls.settings.contacts')),
				[ { name: 'John' } ]

	suite 'readObj()', ->
		setup ->
			localStorage.clear()

			ls = new LocalStore 'settings'
			ls.writeObj
				name: 'Sigrid'
				phone: '555-123123'
				contacts: [
					name: 'John'
				]
