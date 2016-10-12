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
    public function getAllRecords()
    {
        return craft()->webtexttool->getAllRecords();
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


    /**
     * Get a specific record by entryId. If no record is found, returns null
     *
     * @param  int $entryId
     * @return mixed
     */
    public function getRecordByEntryId($entryId)
    {
        return craft()->webtexttool->getRecordByEntryId($entryId);
    }


}
