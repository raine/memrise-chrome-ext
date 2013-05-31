suite "app.Settings", ->
  test "should be present", ->
    assert.ok app.Settings

  suite "with empty localstorage", ->
    setup ->
      localStorage.clear()

    test "should initialize with default values", ->
      settings = new app.Settings()
      for key of OPTIONS_DEFAULTS
        value = OPTIONS_DEFAULTS[key]
        assert.equal settings.get(key), value

    test "should save the default values to localstorage when initialized", ->
      assert.lengthOf localStorage, 0, "localStorage is empty"
      new app.Settings()
      assert.lengthOf localStorage, _.keys(OPTIONS_DEFAULTS).length, "localStorage has as many keys as there are defaults"


  suite "with existing settings in localstorage", ->
    setup ->
      localStorage.clear()
      s = new app.Settings()
      s.set "wilting-threshold", 10

    test "should have the existing settings instead of defaults", ->
      assert.notEqual OPTIONS_DEFAULTS["wilting-threshold"], 10
      s = new app.Settings()
      assert.equal s.get("wilting-threshold"), 10

    test "should have the default value that wasn't set", ->
      s = new app.Settings()
      assert.equal s.get("track-usage"), OPTIONS_DEFAULTS["track-usage"]


  suite "reset()", ->
    test "should return settings to defaults", ->
      settings = new app.Settings()
      settings.set
        "wilting-threshold": 10
        "track-usage": false

      settings.reset()
      for key of OPTIONS_DEFAULTS
        value = OPTIONS_DEFAULTS[key]
        assert.equal settings.get(key), value
