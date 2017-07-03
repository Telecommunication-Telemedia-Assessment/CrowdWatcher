require 'test_helper'

class PairComparisonVotesControllerTest < ActionDispatch::IntegrationTest
  test "should get new" do
    get pair_comparison_votes_new_url
    assert_response :success
  end

end
