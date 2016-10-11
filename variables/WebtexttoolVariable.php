<?php

namespace Craft;

/**
 * Webtexttool Variable provides access to database objects from templates
 */
class WebtexttoolVariable
{
    /**
     * Get all available records
     *
     * @return array
     */
    public function getRecords()
    {
        return craft()->webtexttool->getRecords();
    }

    /**
     * Get a specific record. If no record is found, returns null
     *
     * @param  int $id
     * @return mixed
     */
    public function getRecordById($id)
    {
        return craft()->webtexttool->getRecordById($id);
    }
}
