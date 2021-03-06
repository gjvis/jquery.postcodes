/*
  ======== A Handy Little QUnit Reference ========
  http://api.qunitjs.com/

  Test methods:
    module(name, {[setup][ ,teardown]})
    test(name, callback)
    expect(numberOfAssertions)
    stop(increment)
    start(decrement)
  Test assertions:
    ok(value, [message])
    equal(actual, expected, [message])
    notEqual(actual, expected, [message])
    deepEqual(actual, expected, [message])
    notDeepEqual(actual, expected, [message])
    strictEqual(actual, expected, [message])
    notStrictEqual(actual, expected, [message])
    throws(block, [expected], [message])
*/

var log = [];
// var testName = "jquery.postcodes test";

QUnit.done(function (test_results) {
  var tests = [];
  for(var i = 0, len = log.length; i < len; i++) {
    var details = log[i];
    tests.push({
      name: details.name,
      result: details.result,
      expected: details.expected,
      actual: details.actual,
      source: details.source
    });
  }
  test_results.tests = tests;

  window.global_test_results = test_results;
});
QUnit.testStart(function(testDetails){
  QUnit.log = function(details){
    if (!details.result) {
      details.name = testDetails.name;
      log.push(details);
    }
  };
});

(function($) {
  "use strict";

  var $input_field;
  var $lookup_button;
  var $dropdown;
  var inputId;
  var buttonId;
  var defaults = $.idealPostcodes.defaults;
  var apiKey = "iddqd";

  var isPresent = function (elemName, elemId) {
    notEqual($("#" + elemId).length, 0, "has " + elemName);
  };

  var isNotPresent = function (elemName, elemId) {
    equal($("#" + elemId).length, 0, "has no " + elemName);
  };

  /*
   * Class Method Tests
   *
   */

  module("Class Methods");

  test("$.idealPostcodes.validatePostcodeFormat", 6, function () {
    equal($.idealPostcodes.validatePostcodeFormat("BT74 0AQ"), true);
    equal($.idealPostcodes.validatePostcodeFormat("ID11QD"), true);
    equal($.idealPostcodes.validatePostcodeFormat("id11qd"), true);
    equal($.idealPostcodes.validatePostcodeFormat("id1 1qd"), true);
    equal($.idealPostcodes.validatePostcodeFormat("ID1 1QD"), true);
    equal($.idealPostcodes.validatePostcodeFormat("IDDQD"), false);
  });

  asyncTest("$.idealPostcodes.lookupPostcode should lookup a postcode", 3, function () {
    var success = function (data) {
      start();
      equal(data.code, 2000, "should return 2000 for valid postcode");
      notEqual(data.result.length, 0, "should return an array of addresses");
      equal(data.result[0].postcode, "ID1 1QD", "should contain relevant addresses");
    };
    $.idealPostcodes.lookupPostcode("ID11QD", apiKey, success);
  });

  asyncTest("$.idealPostcodes.lookupPostcode should return an empty response if postcode not found", 2, function () {
    var success = function (data) {
      start();
      equal(data.code, 4040, "should return code 4040 for invalid postcode");
      equal(data.result, undefined, "Postcode should not be defined");
    };
    $.idealPostcodes.lookupPostcode("ID1KFA", apiKey, success);
  });

  asyncTest("$.idealPostcodes.lookupAddress should lookup an address", 3, function () {
    var success = function (data) {
      start();
      equal(data.code, 2000, "should return 2000 for valid search query");
      equal(data.result.total, 7);
      equal(data.result.hits[0].postcode, "ID1 1QD", "should contain relevant addresses");
    };
    $.idealPostcodes.lookupAddress({
      query: "ID1 1QD"
    }, apiKey, success);
  });

  asyncTest("$.idealPostcodes.lookupAddress should lookup an address", 3, function () {
    var success = function (data) {
      start();
      equal(data.code, 2000, "should return 2000 for valid search query");
      equal(data.result.total, 2);
      equal(data.result.hits[0].postcode, "SW1A 2AA", "should contain relevant addresses");
    };
    $.idealPostcodes.lookupAddress({
      query: "10 Downing Street London"
    }, apiKey, success);
  });

  asyncTest("$.idealPostcodes.lookupAddress should lookup an address", 2, function () {
    var success = function (data) {
      start();
      equal(data.code, 2000, "should return 2000 for valid search query");
      equal(data.result.total, 0);
    };
    $.idealPostcodes.lookupAddress({
      query: "ID1 KFA"
    }, apiKey, success);
  });

  asyncTest("$.idealPostcodes.lookupAddress should be sensitive to limits", 2, function () {
    var success = function (data) {
      start();
      equal(data.code, 2000, "should return 2000 for valid search query");
      equal(data.result.hits.length, 20);
    };
    $.idealPostcodes.lookupAddress({
      query: "Test Limit",
      limit: 20
    }, apiKey, success);
  });

  asyncTest("$.idealPostcodes.checkKey should return true if key is usable and cache result", 2, function () {
    var success = function () {
      equal(2000, 2000);
      equal($.idealPostcodes.keyCheckCache["iddqd"], true, "Successful result is cached");
      start();
    };
    var failure = function () {
      start();
    };
    $.idealPostcodes.checkKey("iddqd", success, failure);
  });

  asyncTest("$.idealPostcodes.checkKey should return false if key is not usable and cache result", 2, function () {
    var success = function () {
      start();
    };
    var failure = function () {
      equal(2000, 2000);
      equal($.idealPostcodes.keyCheckCache["idkfa"], false, "Failed result is cached");
      start();
    };
    $.idealPostcodes.checkKey("idkfa", success, failure);
  });

  asyncTest("$.idealPostcodes.checkKey should return false if invalid response is returned and clear the cache", 1, function () {
    var success = function () {
      start();
    };
    var failure = function () {
      start();
      equal(2000, 2000);
    };
    $.idealPostcodes.checkKey("idd", success, failure);
  });

  /*
   * Plugin Initialisation and Usage Tests
   *
   */

  module("jQuery#setupPostcodeLookup", { 
    setup: function () {
      $("#postcode_lookup_field").setupPostcodeLookup({
        api_key: "api_key",
        disable_interval: 0
      });
      defaults = $.idealPostcodes.defaults();
      $input_field = $("#"+defaults.input_id);
      $lookup_button = $("#"+defaults.button_id);
    } 
  });

  test("#setupPostcodeLookup creates necessary elements for postcode lookup", 6, function () {
    ok($input_field.length, "there appears to be an input");
    ok($lookup_button.length, "there appears to be button");
    strictEqual($lookup_button.html(), defaults.button_label,"button has correct labeling");
    strictEqual($input_field.val(), defaults.input_label,"input has correct labeling");
    $.when($input_field.triggerHandler("focus")).done(function () {
      strictEqual($input_field.val(), "","input responds correctly when clicked on");
      $.when($input_field.triggerHandler("blur")).done(function () {
        strictEqual($input_field.val(), defaults.input_label, "input responds correctly when defocused with no input");
      });
    });
  });

  module("Postcode Lookups: Basic Case", { 
    setup: function () {
      $("#postcode_lookup_field").setupPostcodeLookup({
        api_key: apiKey,
        disable_interval: 0,
        onLookupSuccess: function () {
          $.event.trigger("completedJsonp");
        },
        onLookupError: function () {
          $.event.trigger("completedJsonp");
        }
      });
      $input_field = $("#"+defaults.input_id);
      $lookup_button = $("#"+defaults.button_id);
    },
    teardown: function () {
      $(document).off("completedJsonp");
    }
  });

 test("Postcode entries are validated before submission", 2, function () {
    $input_field.val("BOGUSPOSTCODE");
    $lookup_button.trigger("click");
    ok($("#" + defaults.error_message_id).length, "it has an error message");
    strictEqual($("#" + defaults.error_message_id).html(), defaults.error_message_invalid_postcode,"it has the correct error message");
  }); 


  asyncTest("Address options are presented after a successful postcode lookup", 7, function () {
    $input_field.val("ID11QD");
    equal($lookup_button.prop("disabled"), false, "initial lookup button not disabled");
    $(document).on("completedJsonp", function () {
      start();
      equal($lookup_button.prop("disabled"), false, "lookup button not disabled after click");
      $dropdown = $("#"+defaults.dropdown_id);
      ok($dropdown.length, "it has a dropdown menu");
      strictEqual($dropdown.children("option[value=ideal]").text(), defaults.dropdown_select_message, "it has the correct display text");
      $dropdown.val("5").trigger("change"); // Select 3 lined output
      var addressLines = [defaults.output_fields.line_1, defaults.output_fields.post_town, defaults.output_fields.postcode];
      for (var i = 0; i < addressLines.length; i++) {
        ok($(addressLines[i]).val(), addressLines[i] + " has content");
      }
    });
    $lookup_button.trigger("click");
  });
  
  asyncTest("Postcode lookup cleanup", 8, function () {
    $input_field.val("ID11QD");
    equal($lookup_button.prop("disabled"), false, "initial lookup button not disabled");
    $(document).on("completedJsonp", function () {
      start();
      isPresent("default input box", defaults.input_id);
      isPresent("dropdown menu", defaults.dropdown_id);
      isPresent("default lookup button", defaults.button_id);
      equal($lookup_button.prop("disabled"), false, "lookup button not disabled after click");
      $.idealPostcodes.clearAll();
      isNotPresent("default input box", defaults.input_id);
      isNotPresent("dropdown menu", defaults.dropdown_id);
      isNotPresent("default lookup button", defaults.button_id);
    });
    $lookup_button.trigger("click");
  });
  
  asyncTest("Postcode not found result", 4, function () {
    $input_field.val("ID11QE");
    equal($lookup_button.prop("disabled"), false, "initial lookup button not disabled");
    $(document).on("completedJsonp", function () {
      start();
      equal($lookup_button.prop("disabled"), false, "lookup button not disabled after click");
      ok($("#" + defaults.error_message_id).length, "it has an error message");
      strictEqual($("#" + defaults.error_message_id).html(), defaults.error_message_not_found, "it has the correct error message");
    });
    $lookup_button.trigger("click");
  });

  asyncTest("Postcode lookup should be triggered by enter key in input box", 5, function () {
    $input_field.val("ID11QD");
    equal($lookup_button.prop("disabled"), false, "initial lookup button not disabled");
    var e = $.Event("keypress");
    e.which = 13;
    $(document).on("completedJsonp", function () {
      start();
      isPresent("default input box", defaults.input_id);
      isPresent("dropdown menu", defaults.dropdown_id);
      isPresent("default lookup button", defaults.button_id);
      equal($lookup_button.prop("disabled"), false, "lookup button not disabled after click");
    });
    $input_field.trigger(e);
  });

  test("Lookup with invalid postcode caught by regexp", 5, function () {
    $input_field.val("asd");
    equal($lookup_button.prop("disabled"), false, "initial lookup button not disabled");
    $lookup_button.trigger("click");
    isPresent("default input box", defaults.input_id);
    isPresent("default lookup button", defaults.button_id);
    isPresent("error message", defaults.error_message_id);
    equal($lookup_button.prop("disabled"), false, "lookup button not disabled after click");
  });


  asyncTest("Lookup with invalid postcode", 5, function () {
    $input_field.val("ID11QE");
    equal($lookup_button.prop("disabled"), false, "initial lookup button not disabled");
    $(document).on("completedJsonp", function () {
      start();
      isPresent("default input box", defaults.input_id);
      isPresent("default lookup button", defaults.button_id);
      isPresent("error message", defaults.error_message_id);
      equal($lookup_button.prop("disabled"), false, "lookup button not disabled after click");
    });
    $lookup_button.trigger("click");
  });

  module("Postcode Lookups: Custom Input Field", { 
    setup: function () {
      inputId = "customInput";
      $("<input />", {
        id: inputId
      })
      .appendTo($("#qunit-fixture"));
      $("#postcode_lookup_field").setupPostcodeLookup({
        api_key: apiKey,
        input: "#" + inputId,
        disable_interval: 0,
        onLookupSuccess: function () {
          $.event.trigger("completedJsonp");
        },
        onLookupError: function () {
          $.event.trigger("completedJsonp");
        }
      });
      $input_field = $("#"+inputId);
      $lookup_button = $("#"+defaults.button_id);
    },
    teardown: function () {
      $(document).off("completedJsonp");
    }
  });

  test("Lookup elements are setup correctly", 4, function () {
    isNotPresent("default input box", defaults.input_id);
    isPresent("custom input box", inputId);
    isPresent("default lookup button", defaults.button_id);
    isNotPresent("error message", defaults.error_message_id);
  });

  asyncTest("Successful Postcode Lookup", 7, function () {
    $input_field.val("ID11QD");
    equal($lookup_button.prop("disabled"), false, "initial lookup button not disabled");
    $(document).on("completedJsonp", function () {
      start();
      equal($lookup_button.prop("disabled"), false, "lookup button not disabled after click");
      $dropdown = $("#"+defaults.dropdown_id);
      ok($dropdown.length, "it has a dropdown menu");
      strictEqual($dropdown.children("option[value=ideal]").text(), defaults.dropdown_select_message, "it has the correct display text");
      $dropdown.val("5").trigger("change"); // Select 3 lined output
      var addressLines = [defaults.output_fields.line_1, defaults.output_fields.post_town, defaults.output_fields.postcode];
      for (var i = 0; i < addressLines.length; i++) {
        ok($(addressLines[i]).val(), addressLines[i] + " has content");
      }
    });
    $lookup_button.trigger("click");
  });

  asyncTest("Lookup with invalid postcode", 4, function () {
    $input_field.val("ID11QE");
    equal($lookup_button.prop("disabled"), false, "initial lookup button not disabled");
    $(document).on("completedJsonp", function () {
      start();
      isPresent("error message", defaults.error_message_id);
      equal($lookup_button.prop("disabled"), false, "lookup button not disabled after click");
      strictEqual($("#" + defaults.error_message_id).html(), defaults.error_message_not_found, "it has the correct error message");
    });
    $lookup_button.trigger("click");
  });

  test("Invalid postcode caught by regexp", 3, function () {
    $input_field.val("asd");
    equal($lookup_button.prop("disabled"), false, "initial lookup button not disabled");
    $lookup_button.trigger("click");
    isPresent("error message", defaults.error_message_id);
    equal($lookup_button.prop("disabled"), false, "lookup button not disabled after click");
  });


  module("Postcode Lookups: Custom Lookup Trigger", { 
    setup: function () {
      buttonId = "customInput";
      $("<a />", {
        id: buttonId,
        href: ""
      })
      .html("My Custom Button Message")
      .appendTo($("#qunit-fixture"));
      $("#postcode_lookup_field").setupPostcodeLookup({
        api_key: apiKey,
        button: "#" + buttonId,
        disable_interval: 0,
        onLookupSuccess: function () {
          $.event.trigger("completedJsonp");
        },
        onLookupError: function () {
          $.event.trigger("completedJsonp");
        }
      });
      $input_field = $("#"+defaults.input_id);
      $lookup_button = $("#"+buttonId);
    },
    teardown: function () {
      $(document).off("completedJsonp");
    }
  });

  test("Lookup elements are setup correctly", 4, function () {
    isPresent("default input box", defaults.input_id);
    isPresent("custom lookup trigger", buttonId);
    isNotPresent("default lookup button", defaults.button_id);
    isNotPresent("error message", defaults.error_message_id);
  });

  asyncTest("Successful Postcode Lookup", 7, function () {
    var customMessage = $lookup_button.html();
    $input_field.val("ID11QD");
    equal($lookup_button.html(), customMessage, "Button should have custom label");
    $(document).on("completedJsonp", function () {
      start();
      equal($lookup_button.html(), customMessage, "Button should have custom label");
      $dropdown = $("#"+defaults.dropdown_id);
      ok($dropdown.length, "it has a dropdown menu");
      strictEqual($dropdown.children("option[value=ideal]").text(), defaults.dropdown_select_message, "it has the correct display text");
      $dropdown.val("5").trigger("change"); // Select 3 lined output
      var addressLines = [defaults.output_fields.line_1, defaults.output_fields.post_town, defaults.output_fields.postcode];
      for (var i = 0; i < addressLines.length; i++) {
        ok($(addressLines[i]).val(), addressLines[i] + " has content");
      }
    });
    $lookup_button.trigger("click");
  });

  asyncTest("Lookup with invalid postcode", 2, function () {
    $input_field.val("ID11QE");
    $(document).on("completedJsonp", function () {
      start();
      isPresent("error message", defaults.error_message_id);
      strictEqual($("#" + defaults.error_message_id).html(), defaults.error_message_not_found, "it has the correct error message");
    });
    $lookup_button.trigger("click");
  });

  test("Invalid postcode caught by regexp", 1, function () {
    $input_field.val("asd");
    $lookup_button.trigger("click");
    isPresent("error message", defaults.error_message_id);
  });

  module("jQuery#setupPostcodeLookup with passing pre-initialisation check", { 
    setup: function () {
      stop();
      $("#postcode_lookup_field").setupPostcodeLookup({
        // Test key which will return true
        api_key: "iddqd",
        check_key: true,
        disable_interval: 0,
        onLoaded: function () {
          $input_field = $("#"+defaults.input_id);
          $lookup_button = $("#"+defaults.button_id);
          start();
        }
      });
    } 
  });

  test("has postcode lookup tools setup", 6, function () {
    ok($input_field.length, "there is an input field");
    ok($lookup_button.length, "there is a lookup button");
    strictEqual($lookup_button.html(), defaults.button_label, "button has correct labeling");
    strictEqual($input_field.val(), defaults.input_label, "input has correct labeling");
    $.when($input_field.triggerHandler("focus")).done(function () {
      strictEqual($input_field.val(), "","input responds correctly when clicked on");
      $.when($input_field.triggerHandler("blur")).done(function () {
        strictEqual($input_field.val(), defaults.input_label, "input responds correctly when defocused with no input");
      });
    });
  });

  module("jQuery#setupPostcodeLookup with failing pre-initialisation check", { 
    setup: function () {
      stop();
      $("#postcode_lookup_field").setupPostcodeLookup({
        // Test key which will return false
        api_key: "idkfa",
        check_key: true,
        disable_interval: 0,
        onFailedCheck: function () {
          $input_field = $("#"+defaults.input_id);
          $lookup_button = $("#"+defaults.button_id);
          start();
        }
      });
    } 
  });

  test("has no postcode lookup tools setup", 2, function () {
    equal($input_field.length, 0, "there is no postcode input");
    equal($lookup_button.length, 0, "there is no button");
  });

  module("onLoaded Callback Test", {
    setup: function () {
      $("#postcode_lookup_field").setupPostcodeLookup({
        api_key: apiKey,
        disable_interval: 0,
        onLoaded: function () {
          $(this).addClass("myNewRandomClass");
        }
      });
    } 
  });

  test("onLoaded callback should be invoked when plugin loaded", 2, function () {
    var $widget = $(".myNewRandomClass");
    equal($widget.length, 1);
    equal($widget[0].id, "postcode_lookup_field");
  });

  module("onLookupSuccess and onAddressSelected Callback Test", { 
    setup: function () {
      $("#postcode_lookup_field").setupPostcodeLookup({
        api_key: apiKey,
        disable_interval: 0,
        onLookupSuccess: function (data) {
          $.event.trigger("completedJsonp", [data]);
        },
        onAddressSelected: function (selectedData) {
          $.event.trigger("addressSelected", [selectedData]);
        }
      });
      $input_field = $("#"+defaults.input_id);
      $lookup_button = $("#"+defaults.button_id);
    },
    teardown: function () {
      $(document).off("completedJsonp").off("addressSelected");
    }
  });

  asyncTest("onLookupSuccess and onAddressSelected triggered by postcode lookup callback and clicking on an address respectively", 1, function () {
    var addresses;
    $input_field.val("ID11QD");
    $(document).on("completedJsonp", function (e, data) {
      addresses = data;
      $("#idpc_dropdown").val(2).trigger("change");
    });
    $(document).off("addressSelected").on("addressSelected", function (e, selectedData) {
      start();
      deepEqual(addresses.result[2], selectedData);
    });
    $lookup_button.trigger("click");
  });

  asyncTest("onLookupSuccess is triggered when pre-flight validation fails", 2, function () {
    $input_field.val("BOGUS");
    $(document).on("completedJsonp", function (e, data) {
      start();
      equal(data.code, 4040);
      equal(data.message, "Postcode Not Found");
    });
    $lookup_button.trigger("click");
  });

  asyncTest("onLookupSuccess is triggered when Postcode not Found error returned", 2, function () {
    $input_field.val("ID1KFA");
    $(document).on("completedJsonp", function (e, data) {
      start();
      equal(data.code, 4040);
      equal(data.message, "Postcode Not Found");
    });
    $lookup_button.trigger("click");
  });

  asyncTest("onLookupSuccess is triggered when No Lookups Remaining error returned", 1, function () {
    $input_field.val("ID1CLIP");
    $(document).on("completedJsonp", function (e, data) {
      start();
      equal(data.code, 4020);
    });
    $lookup_button.trigger("click");
  });

  asyncTest("onLookupSuccess is triggered when Limit Breached error returned", 1, function () {
    $input_field.val("ID1CHOP");
    $(document).on("completedJsonp", function (e, data) {
      start();
      equal(data.code, 4021);
    });
    $lookup_button.trigger("click");
  });

  module("Remove Organisation from address lines", {
    setup: function () {
      $("#postcode_lookup_field").setupPostcodeLookup({
        api_key: apiKey,
        disable_interval: 0,
        remove_organisation: true,
        onLookupSuccess: function (data) {
          $.event.trigger("completedJsonp", [data]);
        },
        onAddressSelected: function (selectedData) {
          $.event.trigger("addressSelected", [selectedData]);
        }
      });
      $input_field = $("#"+defaults.input_id);
      $lookup_button = $("#"+defaults.button_id);
    },
    teardown: function () {
      $(document).off("completedJsonp");
    }
  });

  asyncTest("strips Organisation name from address lines", 5, function () {
    $input_field.val("ID11QD");
    $(document).on("completedJsonp", function (event, response) {
      start();
      var organisationAddress, organisationIndex;
      $dropdown = $("#"+defaults.dropdown_id);
      ok($dropdown.length, "it has a dropdown menu");

      $.each(response.result, function (index, address) {
        if (address.organisation_name.length !== 0) {
          organisationAddress = address;
          organisationIndex = index;
        }
      });

      ok(organisationAddress);
      
      // Test that organisation address should not be in address lines

      $dropdown.val(organisationIndex.toString()).trigger("change"); // Select organisation address
      var addressLines = [defaults.output_fields.line_1, defaults.output_fields.line_2, defaults.output_fields.line_3];
      $.each(addressLines, function (index, line) {
        notEqual($(line).val(), organisationAddress.organisation_name, "does not contain organisation name");
      });
    });
    $lookup_button.trigger("click");
  });

  module("jQuery#setupPostcodeLookup with address search fallback", { 
    setup: function () {
      $("#postcode_lookup_field").setupPostcodeLookup({
        api_key: "iddqd",
        address_search: true,
        disable_interval: 0,
        onLookupSuccess: function (data) {
          $.event.trigger("completedJsonp", [data]);
        },
        onAddressSelected: function (selectedData) {
          $.event.trigger("addressSelected", [selectedData]);
        }
      });
      $input_field = $("#"+defaults.input_id);
      $lookup_button = $("#"+defaults.button_id);
    },
    teardown: function () {
      $(document).off("completedJsonp");
    }
  });

  asyncTest("should perform an address lookup if postcode is not valid and return options in correct format", 5, function () {
    $input_field.val("10 Downing Street London");
    $(document).on("completedJsonp", function (event, response) {
      start();
      $dropdown = $("#" + defaults.dropdown_id);
      ok($dropdown.length, "it has a dropdown menu");
      equal(response.result.hits.length, 2, "it returns the right number of results");
      $.each(response.result.hits, function (index, elem) {
        ok(elem.postcode === "SW1A 2AA" || elem.postcode === "WC1N 1LX", "it contains the right results");
      });
      equal($dropdown.children("option[value=0]").text(), "Prime Minister & First Lord Of The Treasury, 10 Downing Street, LONDON, SW1A", "it is the right format");
    });
    $lookup_button.trigger("click");
  });
  
  asyncTest("should return an error message if no matches were found in an address search", 3, function () {
    $input_field.val("Street does not exist");
    $(document).on("completedJsonp", function (event, response) {
      start();
      var $errorMessage = $("#" + defaults.error_message_id);
      $dropdown = $("#" + defaults.dropdown_id);
      equal($dropdown.length, 0);
      equal($errorMessage.html(), defaults.error_message_address_not_found);
      equal(response.result.hits.length, 0);
    });
    $lookup_button.trigger("click");
  });

  module("jQuery#setupPostcodeLookup with address search fallback", { 
    setup: function () {
      $("#postcode_lookup_field").setupPostcodeLookup({
        api_key: "iddqd",
        address_search: {
          limit: 20
        },
        disable_interval: 0,
        onLookupSuccess: function (data) {
          $.event.trigger("completedJsonp", [data]);
        },
        onAddressSelected: function (selectedData) {
          $.event.trigger("addressSelected", [selectedData]);
        }
      });
      $input_field = $("#"+defaults.input_id);
      $lookup_button = $("#"+defaults.button_id);
    },
    teardown: function () {
      $(document).off("completedJsonp");
    }
  });

  asyncTest("should perform an address lookup and be sensitive to limit", 22, function () {
    $input_field.val("Test Limit");
    $(document).on("completedJsonp", function (event, response) {
      start();
      $dropdown = $("#" + defaults.dropdown_id);
      ok($dropdown.length, "it has a dropdown menu");
      equal(response.result.hits.length, 20, "it returns the right number of results");
      $.each(response.result.hits, function (index, elem) {
        ok(elem.postcode === "L21 1EX");
      });
    });
    $lookup_button.trigger("click");
  });

  

}(jQuery));
