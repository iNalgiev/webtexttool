var app = angular.module("wttApp", ['tc.chartjs', 'ngSanitize', 'wtt.ui.bootstrap', 'ngCookies', 'cgBusy', 'scrollable-table', 'toastr', 'ngTagsInputWtt', 'angular-ladda']);

app.config(['$httpProvider', '$interpolateProvider', 'toastrConfig', 'laddaProvider',
    function ($httpProvider, $interpolateProvider, toastrConfig, laddaProvider) {
        $httpProvider.interceptors.push('authInterceptor');
        $interpolateProvider.startSymbol('{[').endSymbol(']}');

        angular.extend(toastrConfig, {
            maxOpened: 3,
            preventDuplicates: true,
            preventOpenDuplicates: false
        });

        laddaProvider.setOption({
            style: "expand-left"
        });
    }]);

app.controller("editPageController", ['$scope', '$http', '$q', 'stateService', '$timeout', '$interval', '$cookies', 'suggestionsService', 'keywordService', 'httpService', 'languageService', '$sce', 'toastr', 'synonymService',
    function ($scope, $http, $q, stateService, $timeout, $interval, $cookies, suggestionsService, keywordService, httpService, languageService, $sce, toastr, synonymService) {
        var WttApiBaseUrl = wtt_globals.wttApiBaseUrl;
        var $j = jQuery;
        var authCode = wtt_globals.userData !== null ? wtt_globals.userData.accessToken : "";
        var apiKey = wtt_globals.wttApiKey;

        if (localStorage.getItem('wtt_token') === null || localStorage.getItem('wtt_token') === "" || authCode !== '') {
            localStorage.setItem('wtt_token', authCode);
            if (apiKey !== '') {
                localStorage.setItem('wtt_token', apiKey);
            }
        }

        var metaDescriptionField = document.getElementById('wtt_description');

        if(metaDescriptionField !== null && wtt_globals.record !== "") {
            metaDescriptionField.value = wtt_globals.record.wttDescription;
        }

        $scope.promiseMessage = "Loading...";

        $scope.loadingPromise = httpService.getData(WttApiBaseUrl + "user/authenticated").then(function (result) {
            $scope.auth = result;

            if (result) {
                httpService.getData(WttApiBaseUrl + "user/info").then(function (userInfo) {
                    $scope.userInfo = userInfo;
                    $scope.runRules = false;
                    $scope.runRulesTimeout = 3000;
                    $scope.isCollapsed = false;
                    $scope.ruleSet = 1;
                    $scope.activeEngine = 'seo';
                    $scope.HtmlContent = "";
                    $scope.isReadingLevelDetailsCollapsed = true;
                    var selectedPageNodes = [];
                    var keywordSynonyms = null;

                    var synonymValues = wtt_globals.synonyms;

                    $scope.pageKeywordSynonyms = $j.map(synonymValues, function (element) {
                        return {text: element};
                    });

                    if(synonymValues !== "") {
                        $j.map(synonymValues, function (element) {
                            if ($j('#wttSynonymTags li').length <= 2) {
                                $j("#wttSynonymTags").append('<li><input type="hidden" id="wtt-synonym-tags" name="wtt_synonym_tags[]" value=\"' + element + '\"/></li>');
                            }
                        })
                    }

                    $scope.htmlPopover = $sce.trustAsHtml('<p class="tooltip-content">First select for which language / country you want to optimize your content.<br><br>Then enter your keyword.</p>');
                    $scope.htmlPopoverS = $sce.trustAsHtml('<p class="tooltip-content">While writing, multiple suggestions appear here. These suggestions tell you how you can improve your text for the search engines, according to the latest SEO rules, but also how to structure your text for your readers. Following these suggestions, will raise your optimization score!</p>');
                    $scope.htmlPopoverP = $sce.trustAsHtml('<p class="tooltip-content">Here you can set max 3 alternative keywords that support the main keyword.</p>');

                    var permaLink = wtt_globals.permaLink;
                    var slugValue = document.getElementById("slug");

                    if (permaLink !== "") {
                        $scope.permalink = permaLink.replace(/-/g, ' ');
                    } else if (slugValue !== "" && slugValue !== null) {
                        $scope.permalink = slugValue.value.replace(/-/g, ' ');
                    } else {
                        $scope.permalink = '';
                    }

                    $j("input#slug").keyup(function () {
                        $scope.permalink = $j(this).val().replace(/-/g, ' ');

                        if ($scope.permalink !== null) {
                            $scope.updateSuggestions();
                        }
                    });

                    $scope.getKeywordSynonyms = function (query) {

                        var synonymsDeferred = $q.defer();

                        if (_.isNull(keywordSynonyms)) {

                            if (getContent('wtt-keyword') !== "") {
                                var localKeyword = getContent('wtt-keyword');

                                synonymService.getSynonyms(localKeyword)
                                    .then(function (rawSynonymsData) {
                                        keywordSynonyms = _.pluck(rawSynonymsData.Associations, 'Synonym');
                                        synonymsDeferred.resolve(keywordSynonyms);
                                    });
                            }
                        } else {
                            synonymsDeferred.resolve(keywordSynonyms);
                        }

                        return synonymsDeferred.promise;
                    };

                    $scope.onSynonymsAdded = function (synonym) {
                        if ($j('#wttSynonymTags li').length <= 2) {
                            $j("#wttSynonymTags").append('<li><input type="hidden" id="wtt-synonym-tags" name="wtt_synonym_tags[]" value=\"' + synonym.text + '\"/></li>');
                        }
                    };

                    $scope.onSynonymsRemoved = function (synonym) {
                        $j('input[value=\"' + synonym.text + '\"]').closest('li').remove();
                    };

                    $cookies.put('wtt_lang', userInfo.DefaultLanguageCode);
                    $scope.localLanguageCode = userInfo.DefaultLanguageCode;

                    function getContent(id) {
                        return $j('#' + id).val();
                    }

                    function replaceLineBreaks(str) {
                        return str.replace(/(?:\r\n|\r|\n)/g, '');
                    }

                    var domainUrl = wtt_globals.siteUrl;
                    if (domainUrl !== null) {
                        $scope.domainUrl = getDomain(domainUrl);
                    }

                    function getDomain(url) {
                        var hostName = getHostName(url);
                        var domain = hostName;

                        if (hostName !== null) {
                            var parts = hostName.split('.').reverse();

                            if (parts !== null && parts.length > 1) {
                                domain = parts[1] + '.' + parts[0];

                                if (hostName.toLowerCase().indexOf('.co.uk') != -1 && parts.length > 2) {
                                    domain = parts[2] + '.' + domain;
                                }
                            }
                        }

                        return domain;
                    }

                    function getHostName(url) {
                        var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
                        if (match !== null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
                            return match[2];
                        }
                        else {
                            return null;
                        }
                    }

                    var entryStatus = wtt_globals.status;
                    var livePreviewUrl = Garnish.isMobileBrowser ? wtt_globals.permaLink : Craft.livePreview.previewUrl;
                    var csrfTokenName = window.Craft ? window.Craft.csrfTokenName : '';
                    var csrfTokenValue = window.Craft ? window.Craft.csrfTokenValue : '';

                    var params = {
                        url: livePreviewUrl,
                        entryId: wtt_globals.entryId,
                        locale: Craft.locale,
                        status: entryStatus.replace(/ /g, ''),
                    };

                    if(csrfTokenName !== 'undefined' || csrfTokenValue !== 'undefined') {
                        params[csrfTokenName] = csrfTokenValue;
                    }

                    var getUrlWithToken = function () {
                        var deffered = $q.defer();

                        $j.ajax({
                            url: Craft.getActionUrl('webtexttool/getUrlWithToken'),
                            type: 'POST',
                            dataType: 'json',
                            data: params,
                            success: function (result) {
                                deffered.resolve(result);
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log(JSON.stringify(jqXHR));
                                console.log("AJAX error: " + textStatus + ' : ' + errorThrown);
                            }
                        });
                        return deffered.promise;
                    };

                    var getLiveContent = function (url) {
                        var deffered = $q.defer();

                        $j.ajax({
                            url: url,
                            type: 'GET',
                            success: function (result) {
                                deffered.resolve(result);
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                deffered.reject(errorThrown);
                                console.log(JSON.stringify(jqXHR));
                                console.log("AJAX error: " + textStatus + ' : ' + errorThrown);
                            }
                        });
                        return deffered.promise;
                    };

                    $scope.useMyKeyword = function () {
                        $scope.errorMsg = null;

                        if ($scope.pageHasKeyword()) {
                            if (!validateKeyword()) {
                                toastr.warning($scope.errorMsg, {
                                    closeButton: true,
                                    timeOut: 3000
                                });
                                return;
                            }

                            $scope.Keyword = getContent('wtt-keyword');
                            $scope.Title = getContent('title');
                            $scope.Description = getContent('wtt_description');

                            function getHtmlAndRunSuggestions() {
                                $scope.runRules = true;
                                $scope.runSuggestions();
                            }

                            getUrlWithToken().then(function(response) {
                                getLiveContent(response.url).then(function(response) {
                                    var mainRegExp = new RegExp(/^.*?<main[^>]*>(.*?)<\/main>.*?$/);

                                    if(mainRegExp.test(replaceLineBreaks(response))) {
                                        $scope.HtmlContent = replaceLineBreaks(response).replace(mainRegExp, '$1');
                                    } else {
                                        $scope.HtmlContent = replaceLineBreaks(response).replace(/^.*?<body[^>]*>(.*?)<\/body>.*?$/g, '$1');
                                    }

                                    getHtmlAndRunSuggestions();
                                }, function(result) {
                                    toastr.warning("Something went wrong while fetching the page!");
                                });
                            }, function(result) {
                                toastr.warning(result, "Something went wrong!");
                            });

                            $timeout(function () {
                                $scope.isCollapsed = true;
                            }, 500);
                        } else {
                            console.error("No keyword defined");
                        }
                    };

                    $scope.updateSuggestionsStart = function () {
                        $interval($scope.runSuggestions, $scope.runRulesTimeout);
                    };

                    $scope.rulesRunning = false;
                    var suggestionsRanFirstTime = false;

                    $scope.seoClass = "page-score";
                    $scope.contentClass = "gray-score";

                    $scope.pageScoreChartOptions = {
                        segmentShowStroke: false,
                        showTooltips: false,
                        cutoutPercentage: 70,
                        responsive: true,
                        maintainAspectRatio: false,
                        animateRotate: false
                    };

                    var buildActiveChart = function (score) {
                        return {
                            datasets: [
                                {
                                    borderColor: ["#5cb85c", "#cee9ce"],
                                    data: [score, 100 - score],
                                    backgroundColor: ["#5cb85c", "#eee"]
                                }
                            ]
                        };
                    };

                    var buildInactiveChart = function (score) {
                        return {
                            datasets: [
                                {
                                    borderColor: ["#D5D5D5", "#D5D5D5"],
                                    data: [score, 100 - score],
                                    backgroundColor: ["#D5D5D5", "#eee"]
                                }
                            ]
                        };
                    };

                    function isNullOrEmpty(str) {
                        return (str ? str : "").trim().length === 0;
                    }

                    $scope.data = stateService.data;

                    $scope.data.Resources.forEach(function (el, i) {
                        $scope.data.Resources[el.ResourceKey] = $sce.trustAsHtml(el.HtmlContent);
                    });

                    $scope.analyze = function () {
                        var minValue = 1;

                        if (isNullOrEmpty($scope.HtmlContent)) {
                            toastr.error("Content is required");
                            return;
                        }

                        if ($scope.userInfo.Features.indexOf("ContentQuality") >= 0 && $scope.userInfo.Credits >= minValue) {

                            // update page settings QualityLevels
                            $scope.QualityLevels = $scope.settings;

                            //Save content quality settings to wp database

                            saveContentQualitySettings($scope.QualityLevels);

                            analyzeContentQuality(20);
                        } else {
                            toastr.warning("Text Conversion Optimizer is not included in your subscription. Please upgrade or contact our support team for more info.", "Oops.. You can't do this now. This might not be included in your current webtexttool plan or you have run out of credits for this month.", {
                                closeButton: true,
                                timeOut: 0,
                                extendedTimeOut: 3000
                            });
                        }
                    };

                    function getDefaultQualitySettings() {
                        return {
                            ReadingLevel: "1",
                            DifficultWordsLevel: 1,
                            LongSentencesLevel: 1,
                            AdjectivesLevel: 1,
                            WhitespacesLevel: 1,
                            BulletPointsLevel: 1,
                            ImagesLevel: 1,
                            GenderLevel: 'n',
                            SentimentLevel: 'neutral',

                            GenderList: 1,
                            JargonList: 1,
                            SingularPluralLevel: 1,
                            RepetitionLevel: 1,
                            TextLengthRuleLevel: 1
                        };
                    }

                    function analyzeContentQuality(ruleSet) {

                        $scope.analyzing = true;

                        startContentQualityCompute();

                        $scope.cqModel = {
                            content: $scope.HtmlContent,
                            languageCode: $scope.localLanguageCode,
                            qualityLevels: $scope.settings,
                            ruleSet: ruleSet
                        };

                        // get content quality suggestions
                        httpService.postData(WttApiBaseUrl + "contentquality/suggestions", $scope.cqModel).then(function (response) {
                            endContentQualityCompute();

                            $scope.userInfo.Credits = $scope.userInfo.Credits - 1;

                            renderSuggestions(response.Suggestions);

                            //Save content quality suggestions to database with ajax call
                            saveContentQualitySuggestions(response);

                            // update run date
                            $scope.LastQualityRun = response.ModifiedDate;
                            $scope.LastModified = response.ModifiedDate;

                            // save details
                            $scope.contentQualityDetails = response.Details;

                        }, function error(errorKey) {
                            toastr.error($scope.data.Resources[errorKey].toString());

                            // end analyze animations
                            showError($scope.data.Resources[errorKey].toString());
                            $scope.analyzing = false;
                        });
                    }

                    var saveContentQualitySettings = function (settings) {
                        var deffered = $q.defer();
                        var recordId = getContent("wtt-record-id");

                        var cq_params = {
                            data: settings,
                            entryId: wtt_globals.entryId,
                            recordId: recordId !== "" ? recordId : wtt_globals.record.id
                        };

                        if(csrfTokenName !== 'undefined' || csrfTokenValue !== 'undefined') {
                            cq_params[csrfTokenName] = csrfTokenValue;
                        }

                        $j.ajax({
                            url: Craft.getActionUrl('webtexttool/saveContentQualitySettings'),
                            type: 'POST',
                            dataType: 'json',
                            data: cq_params,
                            success: function (result) {
                                document.getElementById("wtt-record-id").setAttribute('value', result.id);
                                deffered.resolve(result);
                            }, error: function (jqXHR, textStatus, errorThrown) {
                                console.log(JSON.stringify(jqXHR));
                                console.log("AJAX error: " + textStatus + ' : ' + errorThrown);
                            }
                        });

                        return deffered.promise;
                    };

                    var saveContentQualitySuggestions = function (suggestions) {
                        var deffered = $q.defer();
                        var recordId = getContent("wtt-record-id");

                        var details = {
                            "Details": {
                                "ReadingLevel": suggestions.Details.ReadingLevel,
                                "ReadingTime": suggestions.Details.ReadingTime,
                                "ReadingValues": suggestions.Details.ReadingValues
                            }
                        };

                        var data = $j.extend({}, details, suggestions.Suggestions);

                        var cq_params = {
                            data: data,
                            entryId: wtt_globals.entryId,
                            recordId: recordId !== "" ? recordId : wtt_globals.record.id
                        };

                        if(csrfTokenName !== 'undefined' || csrfTokenValue !== 'undefined') {
                            cq_params[csrfTokenName] = csrfTokenValue;
                        }

                        $j.ajax({
                            url: Craft.getActionUrl('webtexttool/saveContentQualitySuggestions'),
                            type: 'POST',
                            dataType: 'json',
                            data: cq_params,
                            success: function (result) {
                                deffered.resolve(result);
                            }, error: function (jqXHR, textStatus, errorThrown) {
                                console.log(JSON.stringify(jqXHR));
                                console.log("AJAX error: " + textStatus + ' : ' + errorThrown);
                            }
                        });

                        return deffered.promise;
                    };

                    function renderSuggestions(response, broadcast) {
                        $scope.contentQualitySuggestions = response.Suggestions;
                        $scope.QualityScore = response.PageScore;
                        $scope.QualityScoreTag = response.PageScoreTag;
                        $scope.analyzing = false;

                        if (broadcast === false){return;}
                        $scope.$broadcast('runSuggestions', {engine: "content"});
                    }

                    function startContentQualityCompute() {
                        $scope.QualityScore = ".";
                        $scope.QualityScoreTag = "Analyzing...";
                        $scope.loadingStep = 0;
                        $scope.$broadcast('runSuggestions', {engine: "loading"});
                        $scope.contentQualityLoading = true;
                    }

                    function endContentQualityCompute() {
                        $scope.contentQualityLoading = false;
                    }

                    function showError(error) {
                        $scope.contentQualityLoading = false;
                        $scope.$broadcast('runSuggestions', {engine: "error", error: error});
                    }

                    var escapeHtml = function (text) {
                        var map = {
                            '&': '&amp;',
                            '<': '&lt;',
                            '>': '&gt;',
                            '"': '&quot;',
                            "'": '&#039;'
                        };

                        return text.toString().replace(/[&<>"']/g, function (m) {
                            return map[m];
                        });
                    };

                    $scope.runSuggestions = function () {
                        if ($scope.runRules == true && !$scope.rulesRunning) {

                            $scope.rulesRunning = true;

                            var content = getHtmlContent($scope.HtmlContent, $scope.Title, escapeHtml($scope.Description), $scope.permalink, $scope.Keyword);

                            $scope.model = {
                                content: content,
                                keywords: $scope.Keyword,
                                languageCode: $scope.localLanguageCode,
                                domain: $scope.domainUrl,
                                synonyms: $scope.pageKeywordSynonyms,
                                ruleSet: $scope.ruleSet
                            };

                            httpService.postData(WttApiBaseUrl + "page/suggestions", $scope.model).then(function (response) {
                                if (!suggestionsRanFirstTime) {
                                    $scope.suggestions = response.Suggestions;
                                    suggestionsRanFirstTime = true;
                                } else {
                                    var updatedSuggestions = response.Suggestions;
                                    _.each($scope.suggestions, function (suggestion, index) {
                                        suggestion.Tag = updatedSuggestions[index].Tag;
                                        suggestion.Importance = updatedSuggestions[index].Importance;
                                        suggestion.Penalty = updatedSuggestions[index].Penalty;
                                        suggestion.Rules = updatedSuggestions[index].Rules;
                                        suggestion.Score = updatedSuggestions[index].Score;
                                        suggestionsService.computeDisplayType(suggestion);
                                    });
                                }

                                $scope.Score = response.PageScore;
                                $scope.ScoreTag = response.PageScoreTag;
                                $scope.runRules = false;
                                $scope.rulesRunning = false;
                                $scope.updateSuggestionsStart();

                                $timeout(function () {
                                    broadcastSelectedNodes();
                                });

                                $scope.$broadcast('runSuggestions', {engine: $scope.activeEngine});
                            })
                        }
                    };

                    $scope.selectEngine = function (engine) {
                        $scope.activeEngine = engine;
                        $scope.$broadcast('runSuggestions', {engine: engine});
                    };

                    $scope.updateSuggestions = function () {
                        $scope.runRules = true;
                    };

                    $scope.$on("runSuggestions", function (event, args) {
                        // console.log(args);

                        $scope.loading = false;
                        $scope.showScore = true;
                        $scope.showError = false;
                        $scope.seoScoreTag = $scope.ScoreTag;
                        $scope.contentScoreTag = $scope.QualityScoreTag;
                        $scope.seoScore = $scope.Score || 0; //(Math.round($scope.Score || 0)) + "%";
                        $scope.contentScore = $scope.QualityScore || 0; //(Math.round($scope.QualityScore || 0)) + "%";

                        if (args.engine == "seo") {
                            $scope.seoClass = "page-score";
                            $scope.contentClass = "gray-score";
                            $timeout(function () {
                                $scope.seoPageScoreData = buildActiveChart(parseInt($scope.seoScore));
                                $scope.contentPageScoreData = buildInactiveChart(parseInt($scope.contentScore));
                            }, 0);
                        } else if (args.engine == "content") {
                            $scope.seoClass = "gray-score";
                            $scope.contentClass = "page-score";
                            $timeout(function () {
                                $scope.seoPageScoreData = buildInactiveChart(parseInt($scope.seoScore));
                                $scope.contentPageScoreData = buildActiveChart(parseInt($scope.contentScore));
                            }, 0);
                        } else if (args.engine == "loading") {
                            $scope.showScore = false;
                            $scope.loading = true;
                            $scope.scoreTag = ".";
                            $scope.primaryScore = "Analyzing...";
                            $scope.secondaryScore = ".";
                        } else if (args.engine == "error") {
                            $scope.scoreTag = ".";
                            $scope.primaryScore = "Analyzing...";
                            $scope.secondaryScore = ".";
                            $scope.error = args.error;
                            $scope.showError = true;
                            $scope.showScore = false;
                            $scope.loading = false;
                        }
                    });

                    /**
                     * Page section/node highlighting
                     */

                    var broadcastSelectedNodes = function () {
                        $scope.$broadcast('editPageController:selectNodes', selectedPageNodes);
                    };

                    var broadcastZeroNodes = function () {
                        var broadcastZeroDeferred = $q.defer();
                        selectedPageNodes = [];
                        $scope.$broadcast('editPageController:selectNodes', selectedPageNodes);
                        broadcastZeroDeferred.resolve();
                        return broadcastZeroDeferred.promise;
                    };

                    $j("input#title").focus(function () {
                        broadcastZeroNodes().then(function () {
                            selectedPageNodes = ['TITLE'];
                            broadcastSelectedNodes();
                        })
                    });

                    $j("input#title").blur(function () {
                        broadcastZeroNodes();
                    });

                    $j("textarea#wtt_description").focus(function () {
                        broadcastZeroNodes().then(function () {
                            selectedPageNodes = ['DESCRIPTION'];
                            broadcastSelectedNodes();
                        })
                    });

                    $j("textarea#wtt_description").blur(function () {
                        broadcastZeroNodes();
                    });

                    function hasCredits() {
                        return userInfo.Credits > 0;
                    }

                    $scope.pageHasKeyword = function () {
                        return getContent('wtt-keyword').length != 0;
                    };

                    var inputKeyword = document.getElementById('wtt-keyword');

                    if (inputKeyword.length != 0) {
                        $scope.useMyKeyword();
                    } else {
                        return;
                    }

                    $j("div#tab1").contents().find("div").focus(function () {
                        broadcastZeroNodes().then(function () {
                            selectedPageNodes = ['MAINCONTENT'];
                            broadcastSelectedNodes();
                        })
                    });

                    $j("div#tab1").contents().find("div").blur(function () {
                        broadcastZeroNodes();
                    });

                    $j("input#title").keyup(function () {
                        $scope.Title = $j(this).val();

                        if ($scope.Title != null) {
                            $scope.updateSuggestions();
                        }
                    });

                    var entryId = wtt_globals.entryId;

                    if (!entryId) {
                        $j("input#wtt-keyword").keyup(function () {
                            $j(this).val('');
                            toastr.warning('Save the entry before entering a keyword!', {
                                closeButton: true,
                                timeOut: 10000,
                                extendedTimeOut: 0
                            });
                        })
                    }

                    $j("textarea#wtt_description").keyup(function () {
                        if (!entryId) {
                            $j(this).val('');
                            toastr.warning('Save the entry before entering a page description!', {
                                closeButton: true,
                                timeOut: 10000,
                                extendedTimeOut: 0
                            });
                        } else {
                            $scope.Description = $j(this).val();

                            if ($scope.Description != null) {
                                $scope.updateSuggestions();
                            }
                        }
                    });

                    $scope.useKeyword = function (keyword) {
                        if ($scope.pageHasKeyword()) {
                            $j("#wtt-keyword").prop('value', keyword.Keyword);

                            $scope.Keyword = keyword.Keyword;
                            $scope.Title = getContent('title');
                            $scope.Description = getContent('wtt_description');

                            function getHtmlAndRunSuggestions() {
                                $scope.runRules = true;
                                $scope.runSuggestions();
                            }

                            getUrlWithToken().then(function(response) {
                                getLiveContent(response.url).then(function(response) {
                                    var mainRegExp = new RegExp(/^.*?<main[^>]*>(.*?)<\/main>.*?$/);

                                    if(mainRegExp.test(replaceLineBreaks(response))) {
                                        $scope.HtmlContent = replaceLineBreaks(response).replace(mainRegExp, '$1');
                                    } else {
                                        $scope.HtmlContent = replaceLineBreaks(response).replace(/^.*?<body[^>]*>(.*?)<\/body>.*?$/g, '$1');
                                    }

                                    getHtmlAndRunSuggestions();
                                });
                            });

                            $timeout(function () {
                                $scope.isCollapsed = true;
                            }, 500);
                        } else {
                            inputKeyword.setAttribute('value', "");
                        }
                    };

                    // Select Keyword Controller
                    var keywordSourceLangCookie = $cookies.get('wtt_keyword_source_lang');

                    $scope.fillKeyword = function (keyword) {
                        $j("#wtt-keyword").prop("value", keyword.Keyword);
                        $timeout(function () {
                            $scope.submitSearchKeyword();
                        }, 500);
                    };

                    $scope.searchModel = {
                        "inputKeyword": "",
                        "KeywordSources": [],
                        "selectedSource": {},
                        "SearchResults": []
                    };

                    var keywordSourceCodeMap = {
                        en: 'us'
                    };

                    // Get Google languages
                    function loadKeywordSources() {
                        keywordService.getKeywordSources().then(
                            function loaded(keywordSources) {
                                $scope.KeywordSources = keywordSources;

                                var appLanguageCode = languageService.getActiveLanguageCode();
                                var mappedLanguageCode = keywordSourceCodeMap[appLanguageCode] || appLanguageCode;

                                var appLanguageKeywordSource = _.find(keywordSources, function (item) {
                                    return item.Value == mappedLanguageCode;
                                });

                                var selectedKeywordSource = _.isUndefined(keywordSourceLangCookie) ? appLanguageKeywordSource : _.find(keywordSources, function (item) {
                                    return item.Value == keywordSourceLangCookie;
                                });

                                $scope.searchModel.selectedSource = selectedKeywordSource;
                            });
                    }

                    $scope.onKeywordBlur = function () {

                        $j('#wtt-keyword').prop('value', $j.trim(cleanKeyword($j('#wtt-keyword').val())));

                        /*var localKeyword = document.getElementById("wtt-keyword");
                        if(localKeyword !== "") {
                            localKeyword.setAttribute('value', $j.trim(cleanKeyword(localKeyword.value)));
                        }*/
                    };

                    $scope.selectKeywordSource = function (keywordSource) {
                        $scope.searchModel.selectedSource = keywordSource;
                        $cookies.put('wtt_keyword_source_lang', keywordSource.Value);
                    };

                    // Mapping Keyword Scores
                    var mapKeywordScores = function (keywords) {
                        var overallScoreLabelMap = {
                            0: "Very Poor",
                            1: "Moderate",
                            2: "Good"
                        };

                        var overallScoreHelpMap = {
                            0: "Overall Score Very Poor",
                            1: "Overall Score Moderate",
                            2: "Overall Score Good"
                        };

                        var overallScoreClassMap = {
                            0: "interval-very-poor",
                            1: "interval-moderate",
                            2: "interval-good"
                        };

                        var overallScoreLabelClassMap = {
                            0: "label-danger",
                            1: "label-warning",
                            2: "label-success"
                        };

                        var volumeScoreMap = {
                            0: {
                                className: "very-low",
                                label: "Very Low",
                                helpText: "Monthly search volume on this keyword is very low."
                            },
                            1: {
                                className: "low",
                                label: "Low",
                                helpText: "Monthly search volume on this keyword is low."
                            },
                            2: {
                                className: "moderate",
                                label: "Moderate",
                                helpText: "Monthly search volume on this keyword is moderate."
                            },
                            3: {
                                className: "high",
                                label: "High",
                                helpText: "Monthly search volume on this keyword is high. A lot of searches are done on this keyword."
                            },
                            4: {
                                className: "very-high",
                                label: "Very High",
                                helpText: "Monthly search volume on this keyword is very high. A lot of search are done on this keyword."
                            }
                        };

                        var competitionMap = {
                            4: {
                                className: "very-easy",
                                label: "Very Easy",
                                helpText: "This means that competition is low on this keyword. Not a lot of (strong) sites are also optimised on this keyword."
                            },
                            3: {
                                className: "easy",
                                label: "Easy",
                                helpText: "Competition on this keyword is not very strong. Not a lot of (strong) sites and pages are also optimised on this keyword."
                            },
                            2: {
                                className: "moderate",
                                label: "Moderate",
                                helpText: "Competition on this keyword is moderate. Quite some (strong) sites and pages are also optimised on this keyword."
                            },
                            1: {
                                className: "hard",
                                label: "Hard",
                                helpText: "Competition on this keyword is strong. A lot of (strong) sites and pages are also optimised on this keyword."
                            },
                            0: {
                                className: "very-hard",
                                label: "Very Hard",
                                helpText: "Competition on this keyword is very strong. A lot of (strong) sites and pages are also optimised on this keyword."
                            }
                        };

                        _.each(keywords, function (result) {
                            if (result.OverallScore >= 0) {
                                result.OverallScoreClass = overallScoreClassMap[result.OverallScore];
                                result.OverallScoreHelp = overallScoreHelpMap[result.OverallScore];
                                result.OverallScoreLabelClass = overallScoreLabelClassMap[result.OverallScore];
                                result.OverallScoreLabel = overallScoreLabelMap[result.OverallScore];
                            } else {
                                result.OverallScoreClass = "interval-moderate";
                                result.OverallScoreLabel = "N/A";
                                result.OverallScoreHelp = "This is an estimation because we have limited data on keyword volume and/or competition";
                                result.OverallScoreLabelClass = "label-warning";
                            }

                            if (result.VolumeScore >= 0) {
                                result.SearchVolumeScoreAttrs = volumeScoreMap[result.VolumeScore];
                            } else {
                                result.SearchVolumeScoreAttrs = {
                                    className: "moderate",
                                    label: "N/A",
                                    helpText: "This is a rough estimation because we have limited data on volume for this keyword."
                                };
                            }

                            if (result.CompetitionScore >= 0) {
                                result.CompetitionScoreAttrs = competitionMap[result.CompetitionScore];
                            } else {
                                result.CompetitionScoreAttrs = {
                                    className: "moderate",
                                    label: "N/A",
                                    helpText: "This is a rough estimation because we have limited data on competition for this keyword."
                                };
                            }
                        });
                        return keywords;
                    };

                    $scope.displaySearchVolume = function (volume) {
                        if (volume < 50) {return "< 50";}
                        return volume;
                    };

                    $scope.submitSearchKeyword = function () {
                        $scope.errorMsg = null;

                        if (hasCredits()) {

                            if (!validateKeyword()) {
                                toastr.warning($scope.errorMsg, {
                                    closeButton: true,
                                    timeOut: 3000
                                });
                                return;
                            }

                            $scope.searchPromise = keywordService.searchKeyword(getContent('wtt-keyword'), $scope.searchModel.selectedSource.Value, $scope.localLanguageCode, 10);
                            $scope.searchPromise.then(
                                function loaded(results) {
                                    $timeout(function () {
                                        $j('body').animate({
                                            scrollTop: $j("#score-analysis-area").offset().top
                                        }, 1000);
                                    });

                                    $scope.searchModel.SearchResults = mapKeywordScores(results);

                                    $scope.inputKeywordResult = _.find(results, function (item) {
                                        return item.Selected == true;
                                    });

                                }, function (message) {
                                    toastr.warning("You have used all your available keyword search credits.", message);
                                }
                            );
                        } else {
                            toastr.warning("You have used all your available keyword search credits.", "Credits below limit.");
                        }
                    };

                    function validateKeyword() {
                        if (!$j("#container")[0].checkValidity()) {return false;}

                        if (getContent('wtt-keyword') === "" || getContent('wtt-keyword') == null) {
                            $scope.errorMsg = "Keyword is required!";
                            return false;
                        }

                        if (getContent('wtt-keyword').length > 250) {
                            $scope.errorMsg = "Keyword is invalid!";
                            return false;
                        }

                        if (getContent('wtt-keyword').indexOf(",") > -1 || getContent('wtt-keyword').indexOf(";") > -1) {
                            $scope.errorMsg = "We accept only one keyword. Please do not use separator special chars , or ; ";
                            return false;
                        }

                        return true;

                        // return !(getContent('wtt-keyword') == "" || getContent('wtt-keyword') == null);
                    }

                    function cleanKeyword(keyword) {
                        if (isNullOrEmpty(keyword)) {
                            return keyword;
                        }
                        return cleanMeta(keyword, false);
                    }

                    // replace with space the special chars and escape single quotes
                    function cleanMeta(text, escape) {
                        // replace with space the special chars
                        var cleanText = (text ? text : "").replace(/["=<>\{\}\[\]\\\/]/gi, ' ');
                        // escape single quotes
                        if (escape == true) {
                            cleanText = cleanText.replace(/[']/g, '\\$&').replace(/\u0000/g, '\\0');
                        }
                        return cleanText;
                    }

                    $scope.dynamicPopover = {
                        templateUrl: 'moreinfo.html'
                    };

                    var initialCQTemplate = {
                        "PageScore": 0.0,
                        "Suggestions": [{
                            "Tag": "Readability",
                            "MetaTag": "Readability",
                            "Rules": null,
                            "Importance": 70.0,
                            "Score": 0.0,
                            "Penalty": 0.0,
                            "Tooltip": null,
                            "SortIndex": 1,
                            "Metadata": {
                                "Category": 20,
                                "ShortName": "Readability",
                                "DisplayName": "Readability",
                                "DisplayType": null,
                                "Order": 1,
                                "Settings": [{"DisplayName": "Elementary", "Value": "1"}, {
                                    "DisplayName": "Highschool",
                                    "Value": "2"
                                }, {"DisplayName": "University", "Value": "3"}],
                                "Rules": [{
                                    "Name": "ReadingLevel",
                                    "Value": "1",
                                    "IsPrimary": true,
                                    "IsStringValue": false
                                }, {
                                    "Name": "DifficultWordsLevel",
                                    "Value": "1",
                                    "IsPrimary": false,
                                    "IsStringValue": false
                                }, {
                                    "Name": "LongSentencesLevel",
                                    "Value": "1",
                                    "IsPrimary": false,
                                    "IsStringValue": false
                                }, {
                                    "Name": "SentenceLengthLevel",
                                    "Value": "1",
                                    "IsPrimary": false,
                                    "IsStringValue": false
                                }, {
                                    "Name": "PassiveVoice",
                                    "Value": "1",
                                    "IsPrimary": false,
                                    "IsStringValue": false
                                }, {
                                    "Name": "DifficultWordsLevel",
                                    "Value": "1",
                                    "IsPrimary": false,
                                    "IsStringValue": false
                                }]
                            }
                        }, {
                            "Tag": "Adjectives",
                            "MetaTag": "Adjectives",
                            "Rules": null,
                            "Importance": 20.0,
                            "Score": 0.0,
                            "Penalty": 0.0,
                            "Tooltip": null,
                            "SortIndex": 1,
                            "Metadata": {
                                "Category": 21,
                                "ShortName": "Adjectives",
                                "DisplayName": "Adjectives",
                                "DisplayType": null,
                                "Order": 2,
                                "Settings": null,
                                "Rules": [{
                                    "Name": "AdjectivesLevel",
                                    "Value": "1",
                                    "IsPrimary": true,
                                    "IsStringValue": false
                                }]
                            }
                        }, {
                            "Tag": "Whitespaces",
                            "MetaTag": "Whitespaces",
                            "Rules": null,
                            "Importance": 20.0,
                            "Score": 0.0,
                            "Penalty": 0.0,
                            "Tooltip": null,
                            "SortIndex": 1,
                            "Metadata": {
                                "Category": 23,
                                "ShortName": "Whitespaces",
                                "DisplayName": "Whitespaces",
                                "DisplayType": null,
                                "Order": 5,
                                "Settings": null,
                                "Rules": [{
                                    "Name": "WhitespacesLevel",
                                    "Value": "1",
                                    "IsPrimary": true,
                                    "IsStringValue": false
                                }, {
                                    "Name": "BulletPointsLevel",
                                    "Value": "1",
                                    "IsPrimary": false,
                                    "IsStringValue": false
                                }]
                            }
                        }, {
                            "Tag": "Gender",
                            "MetaTag": "Gender",
                            "Rules": null,
                            "Importance": 15.0,
                            "Score": 0.0,
                            "Penalty": 0.0,
                            "Tooltip": null,
                            "SortIndex": 1,
                            "Metadata": {
                                "Category": 22,
                                "ShortName": "Gender",
                                "DisplayName": "Gender",
                                "DisplayType": null,
                                "Order": 3,
                                "Settings": [{"DisplayName": "Female", "Value": "f"}, {
                                    "DisplayName": "Neutral",
                                    "Value": "n"
                                }, {"DisplayName": "Male", "Value": "m"}],
                                "Rules": [{
                                    "Name": "GenderLevel",
                                    "Value": "n",
                                    "IsPrimary": true,
                                    "IsStringValue": true
                                }]
                            }
                        }, {
                            "Tag": "Sentiment",
                            "MetaTag": "Sentiment",
                            "Rules": null,
                            "Importance": 10.0,
                            "Score": 0.0,
                            "Penalty": 0.0,
                            "Tooltip": null,
                            "SortIndex": 1,
                            "Metadata": {
                                "Category": 30,
                                "ShortName": "Sentiment",
                                "DisplayName": "Sentiment",
                                "DisplayType": null,
                                "Order": 4,
                                "Settings": [{
                                    "DisplayName": "Negative",
                                    "Value": "negative"
                                }, {"DisplayName": "Neutral", "Value": "neutral"}, {
                                    "DisplayName": "Positive",
                                    "Value": "positive"
                                }],
                                "Rules": [{
                                    "Name": "SentimentLevel",
                                    "Value": "positive",
                                    "IsPrimary": true,
                                    "IsStringValue": true
                                }]
                            }
                        }],
                        "PageScoreTag": "Let’s get started!",
                        "RuleSet": "ContentQuality"
                    };

                    function init() {
                        loadKeywordSources();
                        loadLanguages();

                        $scope.QualityLevels = '';

                        // get content quality settings from db
                        if (wtt_globals.record !== "" && wtt_globals.record.wttContentQualitySettings !== "" && wtt_globals.record.wttContentQualitySettings !== null) {
                            $scope.QualityLevels = JSON.parse(wtt_globals.record.wttContentQualitySettings);
                        }

                        // get page quality levels from settings
                        if ($scope.QualityLevels) {
                            $scope.settings = $scope.QualityLevels;
                        } else {
                            $scope.settings = getDefaultQualitySettings();
                        }

                        if (wtt_globals.record !== "" && wtt_globals.record.wttContentQualitySuggestions !== "" && wtt_globals.record.wttContentQualitySuggestions !== null) {
                            // load last run suggestions
                            var lastRunSuggestions = JSON.parse(wtt_globals.record.wttContentQualitySuggestions);

                            $scope.contentQualityDetails = lastRunSuggestions.Details;

                            //map the new Metadata template to the old Suggestions
                            if(typeof lastRunSuggestions.Suggestions[0].Metadata === "undefined") {

                                var contentQualitySuggestions = _.map(initialCQTemplate.Suggestions, function(element) {
                                    var treasure = _.findWhere(lastRunSuggestions.Suggestions, { Tag: element.Tag });
                                    return _.extend(element, treasure);
                                });

                                lastRunSuggestions.Suggestions = contentQualitySuggestions;
                            }

                            renderSuggestions(lastRunSuggestions, false);

                        } else {
                            // load initial template
                            $scope.contentQualitySuggestions = initialCQTemplate.Suggestions;
                            $scope.QualityScoreTag = initialCQTemplate.Suggestions.PageScoreTag;
                        }

                        var languageCodeDB = document.getElementById('wtt-language-code-field');
                        languageCodeDB.setAttribute('value', $scope.localLanguageCode);
                    }

                    init();

                    // Language service
                    function loadLanguages() {
                        languageService.getLanguages().then(
                            function loaded(languages) {
                                $scope.languages = languages;
                            });
                    }

                    $scope.activeLanguageCode = languageService.getActiveLanguageCode();

                    $scope.$on('userLanguageChanged', function () {
                        $scope.activeLanguageCode = languageService.getActiveLanguageCode();
                    });

                    $scope.setActiveLanguage = function (language) {
                        $scope.activeLanguageCode = language.LanguageCode;
                        updateUserLanguage(language.LanguageCode);
                    };

                    var updateUserLanguage = function (languageCode) {
                        httpService.postData(WttApiBaseUrl + "user/language/" + languageCode).then(function () {
                            $scope.localLanguageCode = languageCode;
                            var languageCodeDB = document.getElementById('wtt-language-code-field');
                            languageCodeDB.setAttribute('value', languageCode);
                            $scope.$broadcast('languageChanged');
                            $scope.useMyKeyword();
                        });
                    };

                });
            }
        });
    }
]);

app.factory("suggestionsService", function () {
    var computeDisplayType = function (suggestion) {
        suggestion.displayScore = suggestion.Score == 0 ? suggestion.Importance * 0.2 : suggestion.Score;
        suggestion.progressType = suggestion.Score < suggestion.Importance / 3 ? "danger" :
            suggestion.Score < suggestion.Importance ? "warning" : "success";
    };

    return {
        computeDisplayType: computeDisplayType
    };
});

app.factory("synonymService", ['$http', '$q', 'httpService',
    function ($http, $q, httpService) {
        var WttApiBaseUrl = wtt_globals.wttApiBaseUrl;

        var getSynonyms = function (word) {
            var dataUrl = WttApiBaseUrl + "synonyms/" + encodeURI(word);
            var deffered = $q.defer();
            httpService.getData(dataUrl).then(function (synonyms) {
                deffered.resolve(synonyms);
            });
            return deffered.promise;
        };

        return {
            getSynonyms: getSynonyms
        }
    }
]);

app.factory("languageService", ['$http', '$q', 'httpService', '$cookies',
    function ($http, $q, httpService, $cookies) {
        var WttApiBaseUrl = wtt_globals.wttApiBaseUrl;

        var getLanguages = function () {
            return httpService.getData(WttApiBaseUrl + "languages");
        };

        var getActiveLanguageCode = function () {

            if (!_.isUndefined($cookies.get('wtt_lang'))) {
                return $cookies.get('wtt_lang');
            }

            var language = window.navigator.userLanguage || window.navigator.language;
            if (language.indexOf("nl") >= 0) {
                return "nl";
            }

            return "en";
        };

        return {
            getLanguages: getLanguages,
            getActiveLanguageCode: getActiveLanguageCode
        }
    }
]);

app.directive("wttPageSlideout", function () {
    return {
        template: wtt_globals.pageSlideOut,
        scope: {
            info: "="
        },
        replace: true
    };
});

app.directive('enforceMaxTags', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelController) {
            var maxTags = attrs.maxTags ? parseInt(attrs.maxTags, "10") : null;

            ngModelController.$validators.checkLength = function (value) {
                if (value && maxTags && value.length > maxTags) {
                    value.splice(value.length - 1, 1);
                }
                return value;
            }
        }
    }
});

app.directive("wttContentQuality", function () {
    return {
        template: wtt_globals.contentQualityTemplate,
        link: function (scope) {
            scope.data = stateService.data;
        }
    };
});

app.filter("boolText", function() {
    return function (boolValue) {
        if (boolValue === "true" || boolValue === true)
            return true;
        else {
            return false;
        }
    }
});

app.directive('wttSuggestion', ["suggestionsService", "$sce", "stateService", function (suggestionsService, $sce, stateService) {
    return {
        template: wtt_globals.suggestionTemplate,
        scope: {
            suggestion: '=',
            uid: '=',
            index: '@'
        },
        replace: true,
        link: function (scope) {
            scope.suggestion.selected = false;
            scope.suggestion.isCollapsed = true;
            suggestionsService.computeDisplayType(scope.suggestion);

            var data = stateService.data;
            scope.data = data;

            var tagMap = {
                'Page Title': ['TITLE'],
                'Page Description': ['DESCRIPTION'],
                'Headings': ['HEADINGS'],
                'Main Content': ['MAINCONTENT'],
                'Miscellaneous': ['MISCELLANEOUS']
            };

            var suggestionTags = tagMap[scope.suggestion.Tag];

            scope.$on('editPageController:selectNodes', function (event, selectedNodeNames) {
                if (selectedNodeNames.length === 0) {
                    scope.suggestion.selected = false;
                    if (scope.suggestion.Score == scope.suggestion.Importance) {
                        scope.suggestion.isCollapsed = true;
                    }
                } else {

                    // title or description collapse behaviour
                    if (_.contains(selectedNodeNames, 'TITLE') || _.contains(selectedNodeNames, 'DESCRIPTION')) {
                        scope.suggestion.isCollapsed = true;
                        if (_.contains(selectedNodeNames, 'TITLE') && scope.suggestion.Tag == 'Page Title' && scope.suggestion.Score !== scope.suggestion.Importance) {
                            scope.suggestion.isCollapsed = false;
                        }
                        if (_.contains(selectedNodeNames, 'DESCRIPTION') && scope.suggestion.Tag == 'Page Description' && scope.suggestion.Score !== scope.suggestion.Importance) {
                            scope.suggestion.isCollapsed = false;
                        }
                    } else {

                        // body nodes collapse behaviour
                        if (scope.suggestion.Tag == 'Page Title' || scope.suggestion.Tag == 'Page Description') {
                            scope.suggestion.isCollapsed = true;
                        } else {
                            if (scope.suggestion.Score !== scope.suggestion.Importance) {
                                scope.suggestion.isCollapsed = false;
                            }
                        }
                    }

                    // selection behaviour
                    _.each(suggestionTags, function (suggestionTag) {
                        if (_.contains(selectedNodeNames, suggestionTag)) {
                            scope.suggestion.selected = true;
                            scope.suggestion.isCollapsed = false;
                            return;
                        }
                    });
                }
            });

            function camelize(str) {
                return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
                    if (+match === 0) return "";
                    return index == 0 ? match.toLowerCase() : match.toUpperCase();
                });
            }

            data.Resources.forEach(function (el, i) {
                data.Resources[el.ResourceKey] = $sce.trustAsHtml(el.HtmlContent);
            });

            var setDisplayTexts = function () {
                var resourceName = scope.suggestion.Tag.replace(new RegExp(" ", "g"), "") + "Label";
                scope.displayName = data.Resources[resourceName].toString();

                scope.name = scope.suggestion.Tag.replace(new RegExp(" ", 'g'), "") + 'Suggestion';
                scope.tip = data.Resources[scope.name];

                scope.domId = camelize(scope.suggestion.Tag) + 'SuggestionBox';
            };

            setDisplayTexts();

        }
    };
}]);

app.directive("wttSuggestionContentQuality", ["suggestionsService", "$sce", "stateService",
    function (suggestionsService, $sce, stateService) {
        return {
            template: wtt_globals.suggestionContentQualityTemplate,
            scope: {
                settings: "=",
                suggestion: "=",
                uid: "=",
                index: "@"
            },
            replace: true,
            link: function (scope, elem, attr) {
                var updateOnAction = function (value) {
                    scope.suggestion.selected = (value != 0);
                };

                var data2 = stateService.data;
                scope.data2 = data2;

                scope.setRuleProp = function (rules, value) {
                    for (var i = 0; i < rules.length; i++) {
                        var rule = rules[i];
                        var prop = rule.Name;
                        if (value === 0) {
                            if (scope.settings[prop]) {
                                scope.settings[prop] = rule.IsStringValue ? '' : 0;
                            } else {
                                scope.settings[prop] = rule.Value;
                            }
                        } else {
                            scope.settings[prop] = value;
                        }
                    }
                };

                var buildAction = function (metadata) {
                    // console.log(metadata);

                    var primaryRule = metadata.Rules[0];
                    var prop = primaryRule.Name;
                    var buttonList = _.map(metadata.Settings, function (item) {
                        return {
                            label: item.DisplayName,
                            tip: item.DisplayName,
                            value: item.Value
                        };
                    });

                    return {
                        buttons: buttonList,
                        action: function (button) {
                            scope.setRuleProp(metadata.Rules, button.value);
                            updateOnAction(scope.settings[prop]);
                        },
                        selected: function (button) {
                            return scope.settings[prop] == button.value;
                        },
                        active: !!scope.settings[prop],
                        display: metadata.DisplayType
                    }
                };

                var action = buildAction(scope.suggestion.Metadata);
                scope.actionConfig = action;

                scope.suggestion.selected = scope.suggestion.Importance > 0;
                scope.suggestion.isCollapsed = false;

                suggestionsService.computeDisplayType(scope.suggestion);

                var camelize = function (str) {
                    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
                        if (+match === 0) return "";
                        return index == 0 ? match.toLowerCase() : match.toUpperCase();
                    });
                };

                data2.Resources.forEach(function (el, i) {
                    data2.Resources[el.ResourceKey] = $sce.trustAsHtml(el.HtmlContent);
                });

                var setDisplayTexts = function () {
                    var resourceName = scope.suggestion.Tag.replace(new RegExp(" ", "g"), "") + "Label";
                    scope.displayName = data2.Resources[resourceName].toString();

                    scope.name = scope.suggestion.Tag.replace(new RegExp(" ", 'g'), "") + 'Suggestion';
                    scope.tip = data2.Resources[scope.name];

                    scope.domId = camelize(scope.suggestion.Tag) + 'SuggestionBox';
                };

                setDisplayTexts();

                scope.$on("languageChanged", setDisplayTexts);

                scope.viewExtraInfoList = function(rule){
                    data2.sliderInfo = JSON.parse(rule.ExtraInfo);
                    data2.sliderInfo.tags = data2.sliderInfo.List;
                    if (data2.sliderInfo.Type == "list"){
                        data2.sliderInfo.tags = _.chain(data2.sliderInfo.List).groupBy(function(item){
                            return item
                        }).map(function(items, key){
                            return {
                                Name: key,
                                Count: items.length}
                        }).value();
                    } else if (data2.sliderInfo.Type == "fullList") {
                        data2.sliderInfo.tags = _.chain(data2.sliderInfo.List).groupBy(function (item) {
                            return item.Word
                        }).map(function (items, key) {
                            return {
                                Name: key,
                                Count: items.length,
                                CssClass: items.length > 0 ? items[0].Type : '',
                                To: items[0].To ? items[0].To.join(", ") : ''
                            };
                        }).value();
                    }

                    jQuery('#slideout').addClass('on');
                }
            }
        };
    }]);


app.factory("keywordService", ['$http', '$q', '$rootScope', 'httpService',
    function ($http, $q, $rootScope, httpService) {
        var WttApiBaseUrl = wtt_globals.wttApiBaseUrl + 'keywords';

        var getKeywordSources = function () {
            return httpService.getData(WttApiBaseUrl + "/sources");
        };

        var searchKeyword = function (keyword, database, language) {
            var deffered = $q.defer();

            httpService.getData(WttApiBaseUrl + "/" + keyword + "/" + database + "/" + language)
                .then(function (results) {
                    deffered.resolve(results);
                }, function (results) {
                    return deffered.reject(results);
                });

            return deffered.promise;
        };

        return {
            getKeywordSources: getKeywordSources,
            searchKeyword: searchKeyword
        }
    }
]);

app.factory("httpService", ['$http', '$q',
    function ($http, $q) {

        var getData = function (url) {

            var deffered = $q.defer();

            // Make a get request
            $http.get(url, {
                withCredentials: true
            })
                .success(function (data, status, headers, config) {
                    deffered.resolve(data);
                }).error(function (error, status) {

                if (status == 401) {
                    return;
                }

                deffered.reject(error.Message);
            });

            return deffered.promise;
        };


        var postData = function (url, dataIn) {

            var deffered = $q.defer();

            // Make a post request
            $http.post(url, dataIn, {
                withCredentials: true
            })
                .success(function (data, status, headers, config) {
                    deffered.resolve(data);
                }).error(function (error, status) {

                if (status == 401) {
                    return;
                }

                deffered.reject(error.Message);
            });

            return deffered.promise;

        };

        return {
            getData: getData,
            postData: postData
        }
    }
]);

app.factory("stateService", [function () {
    var data = {
        Resources: [
            {"ResourceKey":"CQGenericError", "HtmlContent": "We’re sorry, we could not analyze your content. Please try again or contact support@webtexttool.com in case the issues persist.", "LanguageCode": "en"},
            {"ResourceKey":"ContentRequiredError","HtmlContent":"Your page needs some content.","LanguageCode":"en"},
            {"ResourceKey":"ContentMinLengthError","HtmlContent":"Your page content must have at least 150 words.","LanguageCode":"en"},
            {"ResourceKey":"GenericError","HtmlContent":"Something went wrong!","LanguageCode":"en"},
            {"ResourceKey":"LanguageNotSupportedError","HtmlContent":"Detected language is not yet supported!","LanguageCode":"en"},
            {"ResourceKey":"PageTitleLabel","HtmlContent":"Page Title","LanguageCode":"en"},
            {"ResourceKey":"PageDescriptionLabel","HtmlContent":"Page Description","LanguageCode":"en"},
            {"ResourceKey":"HeadingsLabel","HtmlContent":"Headings","LanguageCode":"en"},
            {"ResourceKey":"MainContentLabel","HtmlContent":"Main Content","LanguageCode":"en"},
            {"ResourceKey":"MiscellaneousLabel","HtmlContent":"Miscellaneous","LanguageCode":"en"},
            {"ResourceKey":"HeadingsSuggestion","HtmlContent":"To optimize your content both in terms of readability and SEO, you should structure your content by adding several headings. At the start of your page you normally have an H1 / heading 1 with the title of your page. Next to H1, you should add smaller heading (H2-H6) to structure your content even further.","LanguageCode":"en"},
            {"ResourceKey":"MainContentSuggestion","HtmlContent":"Here you will find several important suggestions for your content. Please have a look at our knowledgebase (Learn tab in the app) to find more background information about these suggestions.","LanguageCode":"en"},
            {"ResourceKey":"MiscellaneousSuggestion","HtmlContent":"Here you will find suggestions to optimize your content. These will have smaller impact on overall optimization, but are good to consider and see if they can fit in your content.","LanguageCode":"en"},
            {"ResourceKey":"PageTitleSuggestion","HtmlContent":"<p>The Page title is important to search engines. And therefore it&#39;s important to you. Think of a catchy title that will trigger a user to click on your page when it&#39;s listed in the search results. Of course it should also cover the content of the page.</p>\r\n\t","LanguageCode":"en"},
            {"ResourceKey":"PageDescriptionSuggestion","HtmlContent":"<p>The page description is important because it&#39;s shown in the search results and it will tell the search and the users what your page is about. So provide a good description of your content and make sure you follow the suggestion for creating a perfect description of your page.</p>\r\n\t","LanguageCode":"en"},
            {"ResourceKey":"Heading1Suggestion","HtmlContent":"<p>A H1 / Header section at the beginning of your page is important because it&#39;s the readable introduction of your page. In some CMS&#39;s the Page Title is automatically inserted at the top of a page in H1/Header 1.</p>\r\n\t","LanguageCode":"en"},
            {"ResourceKey":"Heading2to6Suggestion","HtmlContent":"<p>Use smaller headings (h2, h3, h4, h5 and/or h6) in your content to highlight / summarize paragraphs. Using headers will make it easier for you reader to &quot;scan&quot; the contents of your page. It allows you to catch the reader&#39;s attention.</p>\r\n\t","LanguageCode":"en"},
            {"ResourceKey":"BodySuggestion","HtmlContent":"<p>These suggestions are related to overall content on your page. Our rules suggest a minimum number of words for your page. Also related to the length of your content, is the number of times you should use your keywords. This way you can avoid to put your keyword too many times in the content (&quot;keyword stuffing&quot;), but also make sure that you use your keyword enough times so it will be clear for the search engine what the content is about.</p>\r\n\t","LanguageCode":"en"},
            {"ResourceKey":"SentimentLabel", "HtmlContent": "Sentiment", "LanguageCode": "en"},
            {"ResourceKey":"ReadabilityLabel","HtmlContent":"Readability","LanguageCode":"en"},
            {"ResourceKey":"AdjectivesLabel","HtmlContent":"Text credibility","LanguageCode":"en"},
            {"ResourceKey":"GenderLabel","HtmlContent":"Target audience","LanguageCode":"en"},
            {"ResourceKey":"WhitespacesLabel","HtmlContent":"Text layout","LanguageCode":"en"},
            {"ResourceKey":"BulletpointsLabel","HtmlContent":"Bulletpoints","LanguageCode":"en"},
            {"ResourceKey":"ReadabilitySuggestion","HtmlContent":"Readability: multiple checks on complexity level of the content (reading score/long sentences/difficult words).","LanguageCode":"en"},
            {"ResourceKey":"AdjectivesSuggestion","HtmlContent":"Checks the use of adjectives in your text. Over- or underuse of adjectives will decrease effectiveness of your text.","LanguageCode":"en"},
            {"ResourceKey":"GenderSuggestion","HtmlContent":"Gender check on level (confidence) of content target.","LanguageCode":"en"},
            {"ResourceKey":"SentimentSuggestion","HtmlContent": "Set your desired sentiment and see if your content matches. If it doesn't match, it will show you which words to change.","LanguageCode": "en"},
            {"ResourceKey":"WhitespacesSuggestion","HtmlContent":"Checks the use of white spaces in your content. Use this to make your content easier to scan and read.","LanguageCode":"en"},
            {"ResourceKey":"BulletpointsSuggestion","HtmlContent":"Checks the use of bulletpoints in your content. Use these to make the text easier to scan and read.","LanguageCode":"en"},
            {"ResourceKey":"ReadingLevelHelp","HtmlContent":"<table style=\"width: 100%;\"><tbody><tr><td colspan=\"2\">We have calculated three readability scores for your content and averaged this in the overall readability score. Below you will find the specific scores and a link with more information about each of them.<br/><br/></td></tr><tr><td> <a href=\"https://en.wikipedia.org/wiki/Coleman%E2%80%93Liau_index\" target=\"_blank\">Coleman Liau Index</a></td><td> {[contentQualityDetails.ReadingValues.ColemanLiauIndex | number : 1]}</td></tr><tr><td> <a href=\"https://en.wikipedia.org/wiki/Automated_readability_index\" target=\"_blank\">Automated Readability Index</a></td><td> {[contentQualityDetails.ReadingValues.AutomatedReadabilityIndex | number : 1]}</td></tr><tr><td> <a href=\"https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests\" target=\"_blank\">Flesch-Kincaid Reading ease</a></td><td> {[contentQualityDetails.ReadingValues.FleschKincaidReadingEasy | number : 1]}</td></tr><tr><td> Average</td><td> {[contentQualityDetails.ReadingValues.ReadingAvg | number : 1]} ({[contentQualityDetails.ReadingLevel]})</td></tr></tbody></table>","LanguageCode":"en"}
        ],
        loading: false,
        showSpinner: true,
        languages: null,
        sliderInfo: null
    };

    var clear = function () {
        data.languages = null;
        data.sliderInfo = null;
    };

    return {
        data: data,
        clear: clear
    };
}]);

app.factory('authInterceptor', ["$q",
    function ($q) {
        var sessionInjector = {
            request: function (config) {
                config.headers = config.headers || {};
                config.headers.Authorization = 'Bearer ' + localStorage.getItem('wtt_token');
                config.headers.WttSource = 'CraftCMS';
                return config;
            },
            response: function (response) {
                return response || $q.when(response);
            }
        };
        return sessionInjector;
    }
]);