const Router = require('express').Router
const axios = require('../../../../axios')


module.exports = Router({ mergeParams: true })
    .get('/teams/:slug/subtitle-requests', async (req ,res, next) => {
        try {
            let resJson = { meta: { total_count: 0}, objects: [] }
            const { data: { meta: subReqMeta, objects: subReqObjects }} =
                await axios.get(`/teams/${req.params.slug}/subtitle-requests/${req.query.limit ? `?limit=${req.query.limit}` : ''}
                    ${req.query.work_status ? `&work_status=${req.query.work_status}` : ''}`)
            
            resJson.meta.total_count += subReqMeta.total_count
            resJson.objects.push(...subReqObjects)
            if(req.query.username) {
                const { data: { meta: userSubReqMeta, objects: userSubReqObjects }} = 
                    await axios.get(`/teams/${req.params.slug}/subtitle-requests/?assignee=${req.query.username}`)
                resJson.meta.total_count += userSubReqMeta.total_count
                resJson.objects.push(...userSubReqObjects)
            }
            return res.json(resJson)
        } catch(error) {
            next(error)
        }
    })