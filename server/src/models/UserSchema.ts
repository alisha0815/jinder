import { model, Schema, Types } from 'mongoose'
import { EmployerProfile } from './EmployerProfileSchema';
import { JobSeekerProfile } from './JobSeekerProfile';

interface User {
  _id: string
  externalId: string;
  firstName: string;
  lastName: string;
  email: string;
  type: 'employer' | 'jobseeker'
}

interface Employer extends User {
  type: 'employer'
  employerProfile: EmployerProfile
}


interface JobSeeker extends User {
  type: 'jobseeker'
  jobSeekerProfile: JobSeekerProfile
}

const UserSchema = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
  externalId: { type: String, required: true },
})

const User = model('user', UserSchema);

const findOne = (externalId: string) => {
  return User.aggregate([
    {
      $match: { externalId }
    },
    {
      $lookup: {
        from: 'employerProfiles',
        localField: '_id',
        foreignField: 'userId',
        as: 'employerProfile'
      }
    },
    {
      $unwind: {
        path: '$employerProfile',
        preserveNullAndEmptyArrays: true
      }
    } ,
    {
      $lookup: {
        from: 'jobSeekerProfiles',
        localField: '_id',
        foreignField: 'userId',
        as: 'jobSeekerProfile'
      }
    },
    
    {
      $unwind: {
        path: '$jobSeekerProfile',
        preserveNullAndEmptyArrays: true
      }
    }
  ]).then((result) => result[0])
}

const create = async (payload: Partial<User> & { companyName?: string }) => {
  const user = await User.create(payload)

  if(user.type === 'employer') {
    const employerProfile = await EmployerProfile.create({
      userId: user.id,
      name: payload.companyName,
    })

    return {
      ...user,
      employerProfile 
    }
  }

  return user
}

export { Employer, JobSeeker, findOne, create }

