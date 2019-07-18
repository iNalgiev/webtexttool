<?php


namespace Craft;

class m190602_000001_webtexttool_alterCQSuggestionsColumn extends BaseMigration
{
    /**
     * Any migration code in here is wrapped inside of a transaction.
     *
     * @return bool
     */
    public function safeUp()
    {
        $this->alterColumn('webtexttool_core', 'wttContentQualitySuggestions', array(ColumnType::MediumText));

        return true;
    }
}