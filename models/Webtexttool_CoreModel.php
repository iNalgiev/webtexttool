<?php

namespace Craft;

/**
 * Webtexttool Core Model
 *
 * Provides a read-only object representing the keywords, description or language, which are returned
 * by our service class and can be used in our templates and controllers.
 */
class Webtexttool_CoreModel extends BaseModel
{
    /**
     * Defines what is returned when someone puts {{ wttKeywords }} directly
     * in their template.
     *
     * @return string
     */
    public function __toString()
    {
        return array(
            $this->wttKeywords,
            $this->wttDescription,
            $this->wttLanguage
        );
    }

    /**
     * Define the attributes this model will have.
     *
     * @return array
     */
    public function defineAttributes()
    {
        return array(
            'id'                => AttributeType::Number,
            'entryId'           => AttributeType::Number,
            'wttKeywords'       => AttributeType::String,
            'wttDescription'    => AttributeType::String,
            'wttLanguage'       => AttributeType::String,
        );
    }
}
