// src/Components/Recommendation/RecommendationCard.js
import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material';

const AnnalyticsDashboard = ({ recommendations }) => {
  return (
    <Card className="bg-white shadow-md rounded-md mb-5">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Recommendations
        </Typography>
        <List>
          {recommendations.length > 0 ? (
            recommendations.map((recommendation, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`For ${recommendation.office} in ${recommendation.building}, ${recommendation.floor} - Scenario: "${recommendation.scenario}" with Object: "${recommendation.object}"`}
                  secondary={
                    <>
                      <Typography variant="body2">{recommendation.action}</Typography>
                      <Typography variant="body2">Occurrences: {recommendation.occurrences}</Typography>
                    </>
                  }
                />
              </ListItem>
            ))
          ) : (
            <Typography>No recommendations available.</Typography>
          )}
        </List>
      </CardContent>
    </Card>
  );
};

export default AnnalyticsDashboard;
