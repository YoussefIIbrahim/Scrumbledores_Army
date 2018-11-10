var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;
var triggers = require('./triggers');
var SchemaConfig = require('../../config/schemaNames');
var logger = require('../../config/logger');

var EvaluationSchema = new Schema(
{
    //_id of the BusinessOwner being evaluated in the BusinessOwner model
    ownerID: {type : mongoose.SchemaTypes.ObjectId, required: true, ref: SchemaConfig.BusinessOwner},

    //_id of the Client evaluating in the Client model
    posterID: {type: mongoose.SchemaTypes.ObjectId, required: true, ref: SchemaConfig.Client},
    rating: {type: Number, required: true, min:0, max:5},
    review: {type: String, required: false},
    dateCreated: {type: Date, required:true, default: Date.now()},
    dateUpdated: {type: Date}
})

//Creating indices for the posterID and the ownerID
EvaluationSchema.index({ownerID: 1, posterID: 1}, {unique: true, sparse:true});
EvaluationSchema.index({posterID: 1}, { sparse:true});
EvaluationSchema.index({ownerID: 1}, {sparse:true});

EvaluationSchema.post('save', async function(doc) 
{
    try
    {
        //Wait for the addition of the session in the BusinessOwner's model                
        await mongoose.model(SchemaConfig.BusinessOwner).addEval(doc.ownerID, doc._id);
    }
    catch(error)
    {
        //If there was an error in the addition of the session, rollback and delete the session
        await EvaluationSchema.findByIdAndRemove(doc._id);

        //Throw an error
        throw error;
    }
});

// After removing an Evaluation
EvaluationSchema.post('remove', async function(doc) 
{
   try
    {
        //Wait for the addition of the session in the BusinessOwner's model                
        await mongoose.model(SchemaConfig.BusinessOwner).removeEval(doc.ownerID, doc._id);
    }
    catch(error)
    {

        //Throw an error
        throw error;
    }
});

//After updating, update the lastUpdated date
EvaluationSchema.pre('update', triggers.updateDates);

//Update or add an evaluation
EvaluationSchema.statics.addOrUpdateEvaluation = async function(evalu)
{
    var existing = await this.findOne({ownerID: evalu.ownerID, posterID:evalu.posterID}).exec();
    if(existing)
        return this.update({ownerID: evalu.ownerID, posterID:evalu.posterID}, {rating: evalu.rating, review: evalu.review}).exec();
    else
        return evalu.save();
}

//Remove an evaluation given it's _id
EvaluationSchema.statics.removeEvaluationByID = function(id)
{
    return this.findByIdAndRemove(id).exec();
}

//Remove an evaluation given the ownerID and the posterID
EvaluationSchema.statics.removeEvaluation = function(ownerID, posterID)
{
    return this.findOneAndRemove({ownerID: ownerID, posterID: posterID}).exec();
}

//Remove all evaluations of a given BusinessOwner ownerID
EvaluationSchema.statics.removeAllBusinessEvaluations = function(ownerID)
{
    return this.remove({ownerID: ownerID}).exec();
}

//Remove all evaluations of a given Client ownerID
EvaluationSchema.statics.removeAllClientEvaluations = function(posterID)
{
    return this.remove({posterID: posterID}).exec();
}
module.exports = mongoose.model(SchemaConfig.Evaluation, EvaluationSchema);

