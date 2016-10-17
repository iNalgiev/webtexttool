<?php

namespace Craft;

/**
 *
 * @author    Webtexttool <support@webtexttool.com>
 * @copyright Copyright (c) 2016, Webtexttool
 * @see       http://webtexttool.com
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

    function getVersion()
    {
        return '1.0.0';
    }

    function getDeveloper()
    {
        return 'Webtexttool';
    }

    function getDeveloperUrl()
    {
        return 'http://webtexttool.com';
    }

    public function hasCpSection()
    {
        return true;
    }

    public function init()
    {
        craft()->templates->hook('cp.entries.edit.right-pane', [$this, 'renderCoreTemplate']);
        craft()->on('entries.onBeforeSaveEntry', [$this, 'handleEntrySave']);
    }

    public function renderCoreTemplate(&$context)
    {
        $entry = $context['entry'];
        $entryId = $entry->id;

        $record = craft()->webtexttool->getRecordByEntryId($entryId);

        return craft()->templates->render('webtexttool/core', ['entryId' => $entryId, 'record' => $record]);
    }

    /**
     * Fires WebtexttoolController in case EntriesService::onBeforeSaveEntry() was used.
     *
     */
    public function handleEntrySave()
    {
        craft()->runController('webtexttool/saveRecord');
    }

    /**
     * @inheritDoc IElementType::defineAvailableTableAttributes()
     *
     * @return array
     */
    public function defineAvailableTableAttributes()
    {
        $attributes = array(
            'wttKeywords' => Craft::t('WTT Entry Keyword'),
            'wttDescription' => Craft::t('WTT Meta Description'),
        );
        return $attributes;
    }


    public function getSettingsUrl()
    {
        return "webtexttool";
    }

    public function onAfterInstall()
    {
        craft()->db->createCommand()->insert('webtexttool_core', "");
    }
}