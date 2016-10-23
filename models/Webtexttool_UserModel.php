<?php

namespace Craft;

/**
 * Webtexttool Core Model
 *
 * Provides a read-only object representing the access token, which are returned
 * by our service class and can be used in our templates and controllers.
 */
class Webtexttool_UserModel extends BaseModel
{

    /**
     * Defines what is returned when someone puts {{ accessToken }} directly
     * in their template.
     *
     * @return string
     */
    public function __toString()
    {
        return array(
            $this->accessToken,
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
            'userId'            => AttributeType::String,
            'accessToken'       => AttributeType::String,
        );
    }
}
