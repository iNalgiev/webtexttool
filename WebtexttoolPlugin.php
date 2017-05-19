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
        return '1.1.1';
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
        craft()->on('entries.onSaveEntry', [$this, 'handleEntrySave']);
    }

    public function renderCoreTemplate(&$context)
    {
        $entry = $context['entry'];
        $entryId = $entry->id;

        if(!$entryId) {
            $isNewEntry = 'true';
        } else {
            $isNewEntry = 'false';
        }

        $record = craft()->webtexttool->getRecordByEntryId($entryId);
        $wttApiBaseUrl = craft()->config->get('wttApiBaseUrl', 'webtexttool');

        return craft()->templates->render('webtexttool/core', ['entryId' => $entryId, 'record' => $record, 'isNewEntry' => $isNewEntry, 'wttApiBaseUrl' => $wttApiBaseUrl]);
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
