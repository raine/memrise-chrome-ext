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
