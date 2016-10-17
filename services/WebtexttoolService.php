<?php

namespace Craft;

/**
 * Webtexttool Core Service
 *
 * Provides a consistent API for our plugin to access the database
 */
class WebtexttoolService extends BaseApplicationComponent
{
    /**
     * Get a new blank record
     *
     * @param  array $attributes
     * @return Webtexttool_CoreModel
     */
    public function newRecord($attributes = array())
    {
        $model = new Webtexttool_CoreModel();
        $model->setAttributes($attributes);

        return $model;
    }

    /**
     * Returns all records.
     *
     * @return array
     */
    public function getAllRecords()
    {
        $records = Webtexttool_CoreRecord::model()->findAll(array());

        return Webtexttool_CoreModel::populateModels($records);
    }

    /**
     * Returns a record by its ID.
     *
     * @param int $recordId
     *
     * @return Webtexttool_CoreRecord
     */
    public function getRecordById($recordId)
    {
        $coreRecord = Webtexttool_CoreRecord::model()->findById($recordId);

        if ($coreRecord) {
            return Webtexttool_CoreModel::populateModel($coreRecord);
        }
    }

    /**
     * Returns a record by its entry ID.
     *
     * @param int $entryId
     *
     * @return Webtexttool_CoreModel
     */
    public function getRecordByEntryId($entryId)
    {
        $coreRecord = Webtexttool_CoreRecord::model()->findByAttributes(array('entryId'=>$entryId));

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
        if ($id = $model->getAttribute('id')) {
            $webtexttoolRecord = Webtexttool_CoreRecord::model()->findById($id);
            if (!$webtexttoolRecord) {
                throw new Exception(Craft::t('Can\'t find record with ID "{id}"', array('id' => $id)));
            }
        } else {
            $webtexttoolRecord = new Webtexttool_CoreRecord();
        }

        if ($model->validate()) {
            $attributes = array(
                'entryId' => $model->entryId,
                'wttKeywords' => $model->wttKeywords,
                'wttDescription' => $model->wttDescription,
                'wttLanguage' => $model->wttLanguage,
            );

            foreach ($attributes as $k => $v) {
                $webtexttoolRecord->setAttribute($k, $v);
            }

            if ($webtexttoolRecord->save()) {
                // update id on model (for new records)
                $model->setAttribute('id', $webtexttoolRecord->getAttribute('id'));
                return true;
            } else {
                $model->addErrors($webtexttoolRecord->getErrors());
                return false;
            }
        }
    }
	
	publiv function saveAccessToken(Webtexttool_AdminModel &$model)
	{
		
	}

    /**
     * Delete a record from the database.
     *
     * @param  int $entryId
     * @return int The number of rows affected
     */
    public function deleteRecordByEntryId($entryId)
    {
        return Webtexttool_CoreRecord::model()->deleteAllByAttributes(array('entryId'=>$entryId));
    }
}
