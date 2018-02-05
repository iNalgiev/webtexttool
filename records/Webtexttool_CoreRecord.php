<?php

namespace Craft;

/**
 * Webtexttool core record
 *
 * Provides a definition of the database tables required by our plugin,
 * and methods for updating the database. This class should only be called
 * by our service layer, to ensure a consistent API for the rest of the
 * application to use.
 */
class Webtexttool_CoreRecord extends BaseRecord
{
    /**
     * Gets the database table name
     *
     * @return string
     */
    public function getTableName()
    {
        return 'webtexttool_core';
    }

    /**
     * Define columns for our database table
     *
     * @return array
     */
    public function defineAttributes()
    {
        return array(
            'entryId'                       => array(AttributeType::String, 'required' => true),
            'wttKeywords'                   => array(AttributeType::String, 'default' => ''),
            'wttDescription'                => array(AttributeType::String, 'maxLength' => 1024, 'default' => ''),
            'wttLanguage'                   => array(AttributeType::String, 'default' => ''),
            'wttSynonyms'                   => array(AttributeType::String, 'maxLength' => 1024, 'default' => ''),
            'wttContentQualitySettings'     => array(AttributeType::String, 'column' => ColumnType::Text),
            'wttContentQualitySuggestions'  => array(AttributeType::String, 'column' => ColumnType::Text)
        );
    }

    /**
     * Create a new instance of the current class. This allows us to
     * properly unit test our service layer.
     *
     * @return BaseRecord
     */
    public function create()
    {
        $class = get_class($this);
        $record = new $class();

        return $record;
    }
}
