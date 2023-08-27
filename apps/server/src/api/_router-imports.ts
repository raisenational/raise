/**
 * This file was automatically generated. DO NOT MODIFY IT BY HAND.
 * Instead, modify the server, and run "npm run generate:router" from the server.
 */
/* eslint-disable */

export const importMap = {
  "/admin/audit-logs/by-object/{objectId}/get": () => import("./admin/audit-logs/by-object/{objectId}/get"),
  "/admin/audit-logs/by-subject/{subjectId}/get": () => import("./admin/audit-logs/by-subject/{subjectId}/get"),
  "/admin/fundraisers/get": () => import("./admin/fundraisers/get"),
  "/admin/fundraisers/post": () => import("./admin/fundraisers/post"),
  "/admin/fundraisers/{fundraiserId}/donations/get": () => import("./admin/fundraisers/{fundraiserId}/donations/get"),
  "/admin/fundraisers/{fundraiserId}/donations/post": () => import("./admin/fundraisers/{fundraiserId}/donations/post"),
  "/admin/fundraisers/{fundraiserId}/donations/{donationId}/patch": () => import("./admin/fundraisers/{fundraiserId}/donations/{donationId}/patch"),
  "/admin/fundraisers/{fundraiserId}/donations/{donationId}/payments/get": () => import("./admin/fundraisers/{fundraiserId}/donations/{donationId}/payments/get"),
  "/admin/fundraisers/{fundraiserId}/donations/{donationId}/payments/post": () => import("./admin/fundraisers/{fundraiserId}/donations/{donationId}/payments/post"),
  "/admin/fundraisers/{fundraiserId}/donations/{donationId}/payments/{paymentId}/patch": () => import("./admin/fundraisers/{fundraiserId}/donations/{donationId}/payments/{paymentId}/patch"),
  "/admin/fundraisers/{fundraiserId}/patch": () => import("./admin/fundraisers/{fundraiserId}/patch"),
  "/admin/groups/get": () => import("./admin/groups/get"),
  "/admin/groups/post": () => import("./admin/groups/post"),
  "/admin/groups/{groupId}/patch": () => import("./admin/groups/{groupId}/patch"),
  "/admin/login/get": () => import("./admin/login/get"),
  "/admin/login/google/post": () => import("./admin/login/google/post"),
  "/admin/login/impersonation/post": () => import("./admin/login/impersonation/post"),
  "/admin/login/refresh/post": () => import("./admin/login/refresh/post"),
  "/admin/tasks/get": () => import("./admin/tasks/get"),
  "/admin/tasks/{taskId}/post": () => import("./admin/tasks/{taskId}/post"),
  "/admin/users/get": () => import("./admin/users/get"),
  "/admin/users/post": () => import("./admin/users/post"),
  "/admin/users/{userId}/patch": () => import("./admin/users/{userId}/patch"),
  "/public/fundraisers/{fundraiserId}/donation/post": () => import("./public/fundraisers/{fundraiserId}/donation/post"),
  "/public/fundraisers/{fundraiserId}/get": () => import("./public/fundraisers/{fundraiserId}/get"),
  "/public/status/get": () => import("./public/status/get"),
  "/scheduler/collect-payments/post": () => import("./scheduler/collect-payments/post"),
  "/stripe/webhook/post": () => import("./stripe/webhook/post"),
}
