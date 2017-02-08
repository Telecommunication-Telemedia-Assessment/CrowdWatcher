#ifndef _RANSAC_
#define _RANSAC_

#include <vector>
#include <boost/shared_ptr.hpp>


/* Model Interface */
class Model {
    public:
        virtual ~Model() {}
        virtual std::vector< std::vector<float> *>
        fit(const std::vector< std::vector<float> *> &subset,
                  std::vector< std::vector<float> > &dataset) = 0;
        virtual float getDistanceTreshold() = 0;
        virtual void setDistanceTreshold(float distanceTreshold) = 0;
        virtual int getParamCount() = 0;
};

/* Model for Lines */
class LineModel : public Model {
    public:
        LineModel();
        virtual ~LineModel() {}

        std::vector< std::vector<float> *>
        fit(const std::vector< std::vector<float> *> &subset,
                  std::vector< std::vector<float> > &dataset);
        float getDistanceTreshold();
        void setDistanceTreshold(float distanceTreshold);
        int getParamCount();

    private:
        float getDistance(const std::vector< std::vector<float> *> &subset,
                          const std::vector<float> &point);
        float _distanceTreshold;
};

class Ransac {
    public:
        Ransac(boost::shared_ptr<Model> model);
        void fit(std::vector< std::vector<float> > &dataset);
        size_t getMaxIterations();
        void setMaxIterations(size_t maxIterations);
        void getInliers(std::vector< std::vector<float> > *inliers);

    private:
        boost::shared_ptr<Model> _model;
        std::vector< std::vector<float> *> _inliers;
        size_t _maxIterations;
};


#endif
