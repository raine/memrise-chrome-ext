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

  suite "parseLearningJSON()", ->
    catArr = null

    setup (done) ->
      $.getJSON '/assets/learning.json', (obj, status, xhr) ->
        json = xhr.responseText
        Memrise.parseLearningJSON json, (arr) ->
          catArr = arr
          done()

    test "should parse the JSON correctly", ->
      assert.lengthOf catArr, 3

      category = catArr[0]
      assert.property category, 'name'
      assert.property category, 'wilting'
      assert.property category, 'slug'
      assert.lengthOf Object.keys(category), 3
