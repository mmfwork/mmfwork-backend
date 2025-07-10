import { Response, Request, Router } from "express";
import {Answer, Question, Survey, SurveyData} from "../interfaces/db_firebase"

import admin, { firestore } from 'firebase-admin';

const router_db = Router();

router_db.post('/addsurvey', async (req: Request, res: Response) => {
  try {
    const db = admin.firestore();
    const surveyData:SurveyData = req.body 
    
    const newSurveyDoc = db.collection('surveys').doc()
    const newSurveyDoc_id = newSurveyDoc.id;

    await newSurveyDoc.set({
        title:surveyData.survey.title,
        topic:surveyData.survey.topic,
        description:surveyData.survey.description,
        searchKeywords:surveyData.survey.title.toLowerCase().match(/[\p{L}\d]+/gu)
    })

    surveyData.questions.map(async (question:Question)=>{
        const newQuestionDoc = db.collection('questions').doc()
        const newQuestionDoc_id = newQuestionDoc.id;
        
        await newQuestionDoc.set({
            id_survey:newSurveyDoc_id,
            question: question.question
        })

        const newVariantsDoc = db.collection('variants').doc()
        const newVariantsDoc_id = newVariantsDoc.id;

        await newVariantsDoc.set({
            id_survey:newSurveyDoc_id,
            id_question: newQuestionDoc_id,
            variant: question.answers
        })

    })


    res.status(200).json({ success: true, data:surveyData});
  } catch (error) {
    console.error('Ошибка при получении опросов:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

router_db.post('/deletesurvey', async (req: Request, res: Response) => {
  try {
    const db = admin.firestore()
    const dataDeleteSurvey_id = req.body.id
    const surveyRefDoc = db.collection('surveys').doc(dataDeleteSurvey_id) 
    await surveyRefDoc.delete();
    
    const questionsRef = await db.collection('questions').where('id_survey', '==', dataDeleteSurvey_id).get()
    if(!questionsRef.empty){
      const batch =  db.batch()
      questionsRef.forEach(doc=>{
        batch.delete(doc.ref)
      })

      await batch.commit()
    }

    const variantsRef = await db.collection('variants').where('id_survey', '==', dataDeleteSurvey_id).get()
    if(!variantsRef.empty){
      const batch =  db.batch()
      variantsRef.forEach(doc=>{
        batch.delete(doc.ref)
      })

      await batch.commit()
    }

    res.status(200).json({ success: true, data:{id:dataDeleteSurvey_id}, message:"Опрос был удален"});
  } catch (error) {
    console.error('Ошибка при получении опросов:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

router_db.get('/getquestions', async (req: Request, res: Response) => {
  try{
    const db = admin.firestore()

    const dataSurvey_id = req.query.surveysStartId as string
    const variantsRef = await db.collection('variants').where('id_survey', '==', dataSurvey_id).get()
    
    let data:any[]

    // variantsRef.forEach(doc => {
    //     data.question.push({ id: doc.id, ...doc.data() });
    // });
  }catch (error) {
    console.error('Ошибка при получении данных для вопросов:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
})

router_db.get('/getsurveys', async (req: Request, res: Response) => {
  try{
    const surveysLimit = parseInt(req.query.limit as string) || 10;
    const surveysStartId = req.query.surveysStartId as string
    const searchParameter = (req.query.searchParameter as string)?.toLowerCase() || ''

    const db = admin.firestore()
    let surveysRef:FirebaseFirestore.Query = db.collection('surveys').orderBy('title')

    if (searchParameter) {
        surveysRef = surveysRef
            .where('title', '>=', searchParameter)
            .where('title', '<=', searchParameter + '\uf8ff');
    }

    if (surveysStartId) {
        const startDocRef = await db.collection('surveys').doc(surveysStartId).get();
        if (startDocRef.exists) {
            surveysRef = surveysRef.startAfter(startDocRef);
        } 
        else {
          res.status(404).json({ success: false, message: 'Начальный документ для пагинации не найден.' });
        }
    }

    surveysRef = surveysRef.limit(surveysLimit);

        const querySnapshot = await surveysRef.get();
        const surveys: any[] = [];
        let lastVisibleDocId: string | null = null;

        querySnapshot.forEach(doc => {
            surveys.push({ id: doc.id, ...doc.data() });
        });

        if (querySnapshot.docs.length > 0) {
            lastVisibleDocId = querySnapshot.docs[querySnapshot.docs.length - 1].id;
        }

        res.status(200).json({
            success: true,
            data: surveys,
            nextPageStartId: lastVisibleDocId, 
            message: "Опросы успешно получены."
        });
  }catch (error) {
    console.error('Ошибка при получении опросов:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
})

export default router_db