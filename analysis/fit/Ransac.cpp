#include "Ransac.h"
#include <cmath>
#include <iostream>
#include <limits>
#include <stdexcept>
#include <stdlib.h>

using namespace std;

// returns n random indexes
static vector<int>
sampleIndices(const size_t count, const size_t max)
{
    vector<int> result;

    if (count >= max - 1)
      throw invalid_argument("max should be higher than count");

    while (result.size() < count) {
      const int current = rand() % max;

      // check index for uniqueness
      for (size_t i = 0; i < result.size(); i++) {
        if (current == result[i])
          continue;
      }

      result.push_back(current);
    }

    return result;
}

/*
 * LineModel implementation
 */
LineModel::LineModel() {
  _distanceTreshold = 1.0f;
}

vector< vector<float> *>
LineModel::fit(const vector< vector<float> *> &selection,
               vector< vector<float> > &dataset)
{
    if (selection.size() != 2)
        throw invalid_argument("Selection should contain exactly 2 points");

    vector< vector<float> *> resultset;
    for (size_t i = 0; i < dataset.size(); i++) {
        if (getDistance(selection, dataset[i]) < _distanceTreshold)
          resultset.push_back(&dataset[i]);
    }

    return resultset;
}

float LineModel::getDistanceTreshold() {
  return _distanceTreshold;
}
void LineModel::setDistanceTreshold(float distanceTreshold) {
  _distanceTreshold = distanceTreshold;
}
int LineModel::getParamCount() {
  return 2;
}

/*
 * Get distance between a point and the line defined by the selection
 */
float LineModel::getDistance(const vector< vector<float> *> &selection,
                             const vector<float> &point)
{
    const vector<float> &a = *selection[0];
    const vector<float> &b = *selection[1];

    return abs((b[1] - a[1]) * point[0] - (b[0] - a[0]) * point[1] + b[0] * a[1] - b[1] * a[0]) /
        sqrt(pow(b[1] - a[1], 2) + pow(b[0] - a[0], 2));
}

/*
 * Ransac implementation
 */
Ransac::Ransac(boost::shared_ptr<Model> model) {
    _model = model;
    _maxIterations = 50;
}

size_t Ransac::getMaxIterations() {
  return _maxIterations;
}
void Ransac::setMaxIterations(size_t maxIterations) {
  _maxIterations = maxIterations;
}


/*
 * Determine best fit for the model based on inlier count
 */
void Ransac::fit(vector< vector<float> > &dataset)
{
    int paramCount = _model->getParamCount();
    size_t iterations = 0;
    double probability = 0.99;
    double k = 1;

    while (iterations < k && iterations < _maxIterations) {
        const vector<int> indices = sampleIndices(paramCount, dataset.size());
        vector< vector<float> *> selection;

        for (size_t i = 0; i < indices.size(); i++)
            selection.push_back(&dataset[indices[i]]);

        vector< vector<float> *> result = _model->fit(selection, dataset);

        // store solution if it is larger than the last result
        if (result.size() > _inliers.size()) {
          _inliers = result;

          double pOutlier = 1 - pow(result.size() * 1 / dataset.size(), selection.size());
          pOutlier = max(numeric_limits<double>::epsilon(), pOutlier);     // Avoid division by -Inf
          pOutlier = min(1 - numeric_limits<double>::epsilon(), pOutlier); // Avoid division by 0.
          k = log(1 - probability) / log(pOutlier);
        }

        iterations++;
    }
}

void Ransac::getInliers(vector< vector<float> > *inliers)
{
  for (size_t i = 0; i < _inliers.size(); i++) {
    inliers->push_back(*_inliers[i]);
  }
}
