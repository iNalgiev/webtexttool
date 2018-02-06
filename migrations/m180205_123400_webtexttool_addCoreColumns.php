<?php
namespace Craft;

class m180205_123400_webtexttool_addCoreColumns extends BaseMigration
{

    /**
     * Any migration code in here is wrapped inside of a transaction.
     *
     * @return bool
     */
    public function safeUp()
    {

        $this->addColumnAfter('webtexttool_core', 'wttContentQualitySettings', array(ColumnType::Text), 'wttLanguage');
        $this->addColumnAfter('webtexttool_core', 'wttContentQualitySuggestions', array(ColumnType::Text), 'wttLanguage');
        $this->addColumnAfter('webtexttool_core', 'wttSynonyms', array(ColumnType::Text), 'wttLanguage');

        return true;
    }
}