suite "Memrise", ->
  test "should be present", ->
    assert.ok window.Memrise

  suite "_get()", ->
    requests = []

    setup ->
      @xhr = sinon.useFakeXMLHttpRequest()
      @xhr.onCreate = (req) ->
        requests.push req

    teardown ->
      @xhr.restore()

    test "should make a GET request to URL", ->
      Memrise._get 'http://localhost', sinon.spy()
      assert.lengthOf requests, 1
      assert.equal requests[0].url, 'http://localhost'
      assert.equal requests[0].method, 'GET'

    test "should call error callback when request fails", ->
      @server = sinon.fakeServer.create()
      @server.respondWith 'GET', Memrise.API_URL, [
        403, { "Content-Type": "text/html" }, "FAIL"
      ]

      error = sinon.spy()
      Memrise._get 'http://localhost', null, error

      @server.respond()
      assert.isTrue error.calledOnce

  suite "getCategories()", ->
    suite "with no login", ->
      setup ->
        @server = sinon.fakeServer.create()
        @server.respondWith 'GET', Memrise.API_URL, [
          403, { "Content-Type": "text/html" }, "FAIL"
        ]

      teardown ->
        @server.restore()

      test "should return error in the callback", ->
        cb = sinon.spy()
        Memrise.getCategories cb
        @server.respond()
        assert.isTrue cb.calledWith 'not-logged-in'

  suite "parseLearningJSON()", ->
    catArr = null

    setup (done) ->
      $.getJSON '/assets/learning.json', (obj, status, xhr) ->
        json = xhr.responseText
        Memrise.parseLearningJSON json, (err, arr) ->
          catArr = arr
          done()

    test "should parse the JSON correctly", ->
      assert.lengthOf catArr, 3

      category = catArr[0]
      assert.property category, 'name'
      assert.property category, 'wilting'
      assert.property category, 'slug'
      assert.lengthOf Object.keys(category), 3
