<?php

namespace Craft;

/**
 * Webtexttool Core Service
 *
 * Provides a consistent API for our plugin to access the database
 */
class WebtexttoolCoreService extends BaseApplicationComponent
{

    /**
     * Get a new blank record
     *
     * @param  array $attributes
     * @return Webtexttool_CoreModel
     */
    public function newRecord($attributes = array())
    {
        /*        $model = new Webtexttool_CoreModel();
                $model->setAttributes($attributes);

                return $model;*/
    }

    /**
     * Returns all records.
     *
     * @return array
     */
    public function getRecords()
    {
        $coreRecords = $this->_getCoreRecords();

        if (count($coreRecords) > 0) {
            return Webtexttool_CoreModel::populateModels($coreRecords);
        }

        return [];
    }


    /**
     * Returns a record by its ID.
     *
     * @param int $recordId
     *
     * @return CoreModel
     */
    public function getRecordById($recordId)
    {
        $coreRecord = Webtexttool_CoreRecord::model()->findById($recordId);

        if ($coreRecord) {
            return Webtexttool_CoreModel::populateModel($coreRecord);
        }
    }

    /**
     * Save a new or existing record back to the database.
     *
     * @param Webtexttool_CoreModel $model
     * @return bool
     * @throws Exception
     */
    public function saveRecord(Webtexttool_CoreModel &$model)
    {

        $record = new Webtexttool_CoreRecord();

        $attributes = array(
            'entryId' => $model->getAttribute('entryId'),
            'wttKeywords' => $model->getAttribute('wttKeywords')
        );

        foreach ($attributes as $k => $v) {
            $record->setAttribute($k, $v);
        }

        $record->save();
    }
}
