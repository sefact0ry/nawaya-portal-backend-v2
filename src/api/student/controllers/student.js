'use strict';
// const unparsed = require('koa-body/unparsed.js');
/**
 * student controller
*/

const { createCoreController } = require('@strapi/strapi').factories;


module.exports = createCoreController(
  "api::student.student",
  ({ strapi }) => ({
    async findAvailable(ctx) {
        ctx.query = {
          ...ctx.query,
          Available: {
            $eq: true
          },
        };
    
        const { data, meta } = await strapi.controllers["api::student.student"].find(ctx);
    
        return { data, meta };
    },


    async findByName(ctx) {   
        const entries = await strapi.db.query('api::student.student').findMany({
            where: {
                full_name: 'tony kosseify',
            },
          });
        
        return entries ;
    },

    async find(ctx) {
        const entries = await strapi.db.query('api::student.student').findMany({
            populate: {
                majors: true,
                skills: true,
                job_types: true,
                languages: true,
            },
          });
        
        return entries ;
    },
                // majors: {
                //     // major :"Computer Science",
                //     // id: { $in: [1,2,3] }
                // },

    async addStudentToFavorites(ctx) {
        const { id } = ctx.params;
        const  user_id  = ctx.state.auth.credentials.id;
        try {
            await strapi.db.query('api::student.student').update({
                where: {
                    id: { $eq: id }
                },
                data: {
                    favorite_users: {
                        connect: {
                            id: user_id
                        }
                    }
                }
            });
            return {
                message: 'Student added to favorites successfully'
            }
        } catch(err) {
            ctx.throw(400, err);
        }

    },
    async removeStudentFromFavorites(ctx) {
        const { id } = ctx.params;
        const  user_id  = ctx.state.auth.credentials.id;
        try {
            await strapi.db.query('api::student.student').update({
                where: {
                    id: { $eq: id }
                },
                data: {
                    favorite_users: {
                        disconnect: {
                            id: user_id
                        }
                    }
                }
            });
            return {
                message: 'Student removed from favorites successfully'
            }
        } catch(err) {
            ctx.throw(400, err);
        }
    },

    async findByFilters(ctx) {
        const { majors, languages, skills, job_types, available, favorite, cycleDate } = ctx.request.body;

        const where = {};
        if (favorite) {
            where.favorite_users = {
                id: { $eq: ctx.state.auth.credentials.id }
            }
        }
        if (majors && majors.length > 0) {
            where.majors = {
                major: { $in: majors }
            };
        }
        if (skills && skills.length > 0) {
            where.skills = {
                skill: { $in: skills }
            };
        }
        if (job_types && job_types.length > 0) {
            where.job_types = {
                job_type: { $in: job_types }
            };
        }
        if ( languages && languages.length > 0) {
            where.languages = {
                language: { $in: languages }
            };
        }
        if ( available ) {
            where.Available = true 
        }
        if ( cycleDate ) {
            where.cycle = cycleDate
        }

        // console.log(ctx.state.auth.credentials.id);

        const entries = await strapi.db.query('api::student.student').findMany({
            where,
            populate: {                    
                majors: {
                    select: ['major', 'id']
                },
                skills: {
                    select: ['skill', 'id']
                },
                job_types: {
                    select: ['job_type', 'id']
                },
                languages: {
                    select: ['language', 'id']
                },
                favorite_users: {
                    select: 'id',
                }                    
            },
            orderBy: {
                Available: 'desc'
            }
        });
        return entries ;
    }

  })


);