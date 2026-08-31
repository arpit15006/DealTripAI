'use server'

// Data Imports
import { db as tourPackagesDb } from '@/fake-db/packages/tour-packages'
import { db as destinationsDb } from '@/fake-db/packages/destinations'
import { db as customersDb } from '@/fake-db/apps/customers'
import { db as couponsDb } from '@/fake-db/apps/coupons'
import { db as transactionsDb } from '@/fake-db/apps/transactions'
import { db as invoicesDb } from '@/fake-db/apps/invoices'
import { faqsDb, popularDestinationsDb, recommendedPackagesDb, testimonialsDb } from '@/fake-db/pages/home'
import { db as adminProfileDb } from '@/fake-db/settings/profile'
import { db as rolesDb } from '@/fake-db/settings/roles'
import { db as membersDb } from '@/fake-db/settings/members'
import { db as storeInformationDb } from '@/fake-db/settings/store-information'
import { db as emailTemplatesDb } from '@/fake-db/settings/email-templates'
import { db as reviewsDb } from '@/fake-db/settings/reviews'

// Utils Imports
import { buildPackageDetail } from '@/utils/build-package-detail'

// Tour Package Actions
export const getTourPackagesData = async () => {
  return tourPackagesDb
}

export const getPublishedTourPackagesData = async () => {
  return tourPackagesDb.filter(tourPackage => tourPackage.isPublished !== false)
}

export const getPackageDetailData = async (slug: string) => {
  const basePackage = tourPackagesDb.find(tourPackage => tourPackage.slug === slug)

  if (!basePackage || basePackage.isPublished === false) {
    return null
  }

  return buildPackageDetail(basePackage)
}

// Destination Actions
export const getDestinationsData = async () => {
  return destinationsDb
}

// Customer Actions
export const getCustomersData = async () => {
  return customersDb
}

// Coupon Actions
export const getCouponsData = async () => {
  return couponsDb
}

// Transaction Actions
export const getTransactionsData = async () => {
  return transactionsDb
}

// Invoice Actions
export const getInvoicesData = async () => {
  return invoicesDb
}

// Home Page Actions
export const getHomePageData = async () => {
  return {
    popularDestinations: popularDestinationsDb,
    recommendedPackages: recommendedPackagesDb,
    testimonials: testimonialsDb,
    faqs: faqsDb
  }
}

// Admin Profile Actions
export const getAdminProfile = async () => {
  return adminProfileDb
}

// Store Information Actions
export const getStoreInformationSettings = async () => {
  return storeInformationDb
}

// Members Actions
export const getMembersData = async () => {
  return membersDb
}

// Roles Actions
export const getRolesData = async () => {
  return rolesDb
}

// Email Templates Actions
export const getEmailTemplatesData = async () => {
  return emailTemplatesDb
}

// Review Actions
export const getReviewsData = async () => {
  return reviewsDb
}
