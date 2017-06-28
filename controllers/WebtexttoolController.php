<?php
namespace Craft;

/**
 * The MainController class is a controller that handles the plugin core functionality.
 *
 * @author    Webtexttool
 * @package   plugins.webtexttool.controllers
 * @since     1.0
 */

class WebtexttoolController extends BaseController
{

    /**
     * Save Record
     *
     * Create or update an existing record, based on POST data
     */
    public function actionSaveRecord()
    {

        $this->requirePostRequest();

        if ($id = craft()->request->getPost('recordId')) {
            $model = craft()->webtexttool->getRecordById($id);
        } else {
            $model = craft()->webtexttool->newRecord($id);
        }

        $model->entryId = craft()->request->getPost('entryId');
        $model->wttKeywords = craft()->request->getPost('wtt_keyword');
        $model->wttDescription = craft()->request->getPost('wtt_description');
        $model->wttLanguage = craft()->request->getPost('wtt_language');

        if ($model->validate()) {
            craft()->webtexttool->saveRecord($model);
        }
    }

    public function actionGetUrlWithToken()
    {
        $this->requireAjaxRequest();

        $params = array('entryId' => craft()->request->getPost('entryId'), 'locale' => craft()->request->getPost('locale'));

        $status = array('status' => craft()->request->getPost('status'));

        if($status['status'] != "live") {
            craft()->tokens->deleteExpiredTokens();

            $token = craft()->tokens->createToken(array('action' => 'entries/viewSharedEntry', 'params' => $params));
            $url = UrlHelper::getUrlWithToken(craft()->request->getPost('url'), $token);
        } else {
            $url = craft()->request->getPost('url');
        }

        $this->returnJson(array('url' => $url));
    }

    public function actionSaveAccessToken()
    {
        $this->requireAjaxRequest();

        if ($id = craft()->request->getPost('userRecordId')) {
            $model = craft()->webtexttool->getAccessTokenById($id);
        } else {
            $model = craft()->webtexttool->newUserRecord($id);
        }

        $model->userId = craft()->request->getPost('userId');
        $model->accessToken = craft()->request->getPost('accessToken');

        if ($model->validate()) {
            craft()->webtexttool->saveAccessToken($model);
        }

        $response = [
            'message' => 'success'
        ];

        $this->returnJson($response);
    }
}