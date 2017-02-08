#ifndef _SolutionManager_
#define _SolutionManager_

#include <vector>
#include <boost/shared_ptr.hpp>

template<typename T>
struct Solution {
	std::vector<T> predictions;
	std::vector<T> errors;
	std::vector<int> errors_frames;

	enum Axis {
		X = 0,
		Y
	};

	Axis axis;
};

class SolutionManager {
	std::vector< boost::shared_ptr< Solution<float> > > solutions;


public:

	void addSolution(const std::vector<float>& predictions, const std::vector<float>& errors, const std::vector<int>& errors_frames, Solution<float>::Axis axis);
	Solution<float> getSolution(Solution<float>::Axis axis) const;
	void compile();

private:
	void computeAvgSolution(Solution<float>::Axis axis);

};


#endif

