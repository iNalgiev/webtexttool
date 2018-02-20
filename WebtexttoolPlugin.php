<?php

namespace Craft;

/**
 *
 * @author    Webtexttool <support@webtexttool.com>
 * @copyright Copyright (c) 2017, Webtexttool
 * @see       https://webtexttool.com
 * @package   webtexttool
 * @since     1.0
 */


class WebtexttoolPlugin extends BasePlugin
{
    public function getName()
    {
        return 'Webtexttool';
    }

    public function getDescription()
    {
        return 'Webtexttool is the easiest way to create SEO proof content to rank higher and get more traffic. Realtime optimization, keyword research and more.';
    }

    public function getVersion()
    {
        return '1.2.0';
    }

    public function getDeveloper()
    {
        return 'Webtexttool';
    }

    public function getDeveloperUrl()
    {
        return 'https://webtexttool.com';
    }

    public function getReleaseFeedUrl()
    {
        return 'https://raw.githubusercontent.com/iNalgiev/webtexttool/master/releases.json';
    }

    public function hasCpSection()
    {
        return true;
    }

    public function init()
    {
        craft()->templates->hook('cp.entries.edit.right-pane', [$this, 'renderCoreTemplate']);

        $wttApiBaseUrl = craft()->config->get('wttApiBaseUrl', 'webtexttool');
        $currentUser = craft()->userSession->getUser();
        $path = craft()->request->getPath();

        if($path == 'webtexttool') {
            craft()->templates->includeJsResource('webtexttool/js/wtt-admin.min.js');
            craft()->templates->includeJsResource('webtexttool/js/app-controller.js');

            craft()->templates->includeJs('var wtt_dashboard = '.JsonHelper::encode(array(
                    'accountTemplate' => craft()->templates->render('webtexttool/account'),
                    'loginTemplate' => craft()->templates->render('webtexttool/login'),
                    'wttApiBaseUrl' => $wttApiBaseUrl,
                    'currentUserId' => $currentUser->id,
                    'userData' => craft()->webtexttool->getAccessTokenByUserId($currentUser->id),
                    'wttApiKey' => craft()->config->get('wttApiKey', 'webtexttool'),
                )).';');
        }

        craft()->on('entries.onSaveEntry', [$this, 'handleEntrySave']);
    }

    public function renderCoreTemplate(&$context)
    {
        $entry = $context['entry'];
        $entryId = $entry->id;

        $record = craft()->webtexttool->getRecordByEntryId($entryId);
        $wttApiBaseUrl = craft()->config->get('wttApiBaseUrl', 'webtexttool');
        $currentUser = craft()->userSession->getUser();

        craft()->templates->includeJsResource('webtexttool/js/wtt-core.min.js', false);
        craft()->templates->includeJsResource('webtexttool/js/getHtmlContent.js', false);
        craft()->templates->includeJsResource('webtexttool/js/edit-page-controller.js', false);

        craft()->templates->includeJs('var wtt_globals = '.JsonHelper::encode(array(
                'entryId' => $entryId,
                'record' => $record,
                'synonyms' => JsonHelper::decode($record ? $record->wttSynonyms : ""),
                'siteUrl' => craft()->getSiteUrl(),
                'suggestionTemplate' => craft()->templates->render('webtexttool/directives/wtt-suggestion'),
                'contentQualityTemplate' => craft()->templates->render('webtexttool/directives/wtt-content-quality'),
                'suggestionContentQualityTemplate' => craft()->templates->render('webtexttool/directives/wtt-suggestion-content-quality'),
                'pageSlideOut' => craft()->templates->render('webtexttool/directives/wtt-page-slideout'),
                'wttApiBaseUrl' => $wttApiBaseUrl,
                'locale' => $entry->locale,
                'userData' => craft()->webtexttool->getAccessTokenByUserId($currentUser->id),
                'wttApiKey' => craft()->config->get('wttApiKey', 'webtexttool'),
                'permaLink' => craft()->entries->getEntryById($entryId) ? craft()->entries->getEntryById($entryId)->getUrl() : "",
                'status' => craft()->entries->getEntryById($entryId) ? craft()->entries->getEntryById($entryId)->getStatus() : ""
            )).';', false);

        return craft()->templates->render('webtexttool/core', ['entryId' => $entryId, 'record' => $record, 'wttApiBaseUrl' => $wttApiBaseUrl, 'locale' => $entry->locale]);
    }

    /**
     * Fires actionSaveRecord controller in case EntriesService::onSaveEntry() was used.
     *
     */
    public function handleEntrySave()
    {
        craft()->runController('webtexttool/saveRecord');
    }

    public function getSettingsUrl()
    {
        return "webtexttool";
    }
}
