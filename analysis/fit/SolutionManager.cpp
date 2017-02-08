#include "SolutionManager.h"
#include <limits>
#include <iostream>
#include <cmath>

void SolutionManager::addSolution(const std::vector<float>& predictions, const std::vector<float>& errors, const std::vector<int>& errors_frames, Solution<float>::Axis axis) {
	boost::shared_ptr< Solution<float> > solution (new Solution<float>);

	solution->predictions = predictions;
	solution->errors = errors;
	solution->errors_frames = errors_frames;
	solution->axis = axis;

	solutions.push_back(solution);

}


Solution<float> SolutionManager::getSolution(Solution<float>::Axis axis) const {

	std::vector<float> predictions(solutions.front()->predictions.size());
	std::vector<float> errors(solutions.front()->errors.size());

	if(solutions.size() == 0) return Solution<float>();


	int minErrorIndex = 0;
	for(int i = 0; (size_t) i < predictions.size(); ++i) {

		// identify the closest verification point
		int minDiff = std::numeric_limits<int>::max();
		int minDiffIndex = 0;

		for(int s = 0; (size_t) s < solutions[0]->errors_frames.size(); ++s) {
			if(abs(solutions[0]->errors_frames[s] - i) < minDiff) {
				minDiff = std::abs(solutions[0]->errors_frames[s] - i) ;
				minDiffIndex = s;
			}
		}


		// find the solution with the smallest error
		float minError = std::numeric_limits<float>::max();
		for(int s = 0; (size_t) s < solutions.size(); ++s) {
			if(solutions[s]->axis != axis)
				continue;

			if(std::abs(solutions[s]->errors[minDiffIndex]) < minError) {
				minError = std::abs(solutions[s]->errors[minDiffIndex]);
				minErrorIndex = s;
			}
		}


		// assign the solution producing the smallest error
		predictions[i] = solutions[minErrorIndex]->predictions[i];
		errors[minDiffIndex] = minError;

	}


	Solution<float> result;
	result.predictions = predictions;
	result.errors = errors;
	result.errors_frames = solutions[minErrorIndex]->errors_frames;
	result.axis = axis;

	return result;

}

void SolutionManager::compile() {
	computeAvgSolution(Solution<float>::X);
	computeAvgSolution(Solution<float>::Y);
}

void SolutionManager::computeAvgSolution(Solution<float>::Axis axis) {
	int nb_solutions = 0;
	for(size_t i = 0 ; i < solutions.size() ; ++i) {
		if(solutions[i]->axis == axis)
			++nb_solutions;
	}

	std::cout << "axis: " << axis << " " << nb_solutions << std::endl;

	std::vector<float> predictions(solutions.front()->predictions.size());
	std::vector<float> errors(solutions.front()->errors.size());

	int one_solution_index = -1;
	for(size_t i = 0 ; i < solutions.size() ; ++i) {
		if(solutions[i]->axis != axis)
			continue;

		one_solution_index = i;
		for(size_t n = 0 ; n < solutions[i]->predictions.size() ; ++n) {
			predictions[n] += solutions[i]->predictions[n] / nb_solutions;
		}
	}

	int errors_frames_index = 0;
	for(int i = 0 ; (size_t) i < predictions.size() ; ++i) {
		if(i != solutions[one_solution_index]->errors_frames[errors_frames_index])
			continue;

		float click_positions = solutions[one_solution_index]->predictions[i] - solutions[one_solution_index]->errors[errors_frames_index];

		errors[errors_frames_index] = predictions[i] - click_positions;

		++errors_frames_index;
	}

	addSolution(predictions, errors, solutions[one_solution_index]->errors_frames, axis);

}
